/* eslint-env jasmine */
/* eslint-disable quotes */
import * as se from '../src/subtle-crypto-utils'
import {ab2base64urlstr, ascii2ab} from '../src/ab-utils'
import * as testData from '../test/test-data'
import {atHash} from '../test/tlib'
import bows from 'bows'

const log = bows('Anvil Test')

// localStorage.debug = true triggers log statements

const wcs = window.crypto.subtle

function sign_token (cryptoKey, ascii_token, token_name) {
  return wcs.sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: {name: 'SHA-256'}
    },
    cryptoKey.privateKey,
    ascii2ab(ascii_token))
    .then(signature => {
      const result = {}
      result.signature = ab2base64urlstr(signature)
      log.debug(`${token_name} signature= ${result.signature}`)
      result.token = `${ascii_token}.${result.signature}`
      log.debug(`${token_name} jws= ${result.token}`)
      return result
    })
}

describe('Check jwk sign verification', () => {
  describe('self generated key', () => {
    // Signing failed for me on Safari 9.0.2 on OS-X
    // https://github.com/vibornoff/webcrypto-shim master from 1/10/2016
    // all other tests pass however.
    let result = {}

    beforeEach(done => {
      wcs.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: {name: 'SHA-256'},
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01])
        },
        true,  // extractable refers to the private key. public key is always extractable.
        ['sign', 'verify']
      ).then(k => {
        log.debug('generated key:', k)
        result.ppkey = k
        return wcs.exportKey(
          'jwk',
          k.publicKey)
          .then(
            pubKey => {
              result.jwtPubKey = pubKey
            },
            err => log.debug('Gen or export public key failed:', err, err.stack)
          ).then(wcs.exportKey('jwk', k.privateKey)
          ).then(
            privKey => {
              result.jwtPrivKey = privKey
            },
            err => log.debug('Gen or export private key failed:', err, err.stack)
          )
      }).then(() => {
        log.debug('Exported public key:', result.jwtPubKey)
        log.debug('Exported private key:', result.jwtPrivKey)
      }).then(() => {
        const access2sign = testData.encode_token_to_sign(testData.access_token)
        const id2sign = testData.encode_token_to_sign(testData.id_token)
        return Promise.all([
          sign_token(result.ppkey, access2sign, 'access-token'),
          sign_token(result.ppkey, id2sign, 'id-token')
        ])
      }).then(([access, id]) => {
        result.token = access.token
        return atHash(access.token).then(atHash => {
          log.debug('atHash= ', atHash)
        }).then(Promise.all([
          se.verifyJWT(result.jwtPubKey, access.token).then(res => {
            log.debug('se.verifyJWT fulfilled', res)
          }),
          se.verifyJWT(result.jwtPubKey, id.token).then(res => {
            log.debug('se.verifyJWT fulfilled', res)
          })
        ]))
      }).catch(err => {
        log.error('se.verifyJWT caught err:', err, err.stack)
        // subsequent then calls done in this case.
      }).then(() => {
        log('calling beforeEach done /2/')
        done()
      })
    })

    it('should verify a matching token with key', done => {
      log('it calling se.verifyJWT', result)
      se.verifyJWT(result.jwtPubKey, result.token).then(
        verifiedToken => {
          expect(verifiedToken.header).toBeDefined()
          expect(verifiedToken.payload).toBeDefined()
          done()
        },
        err => {
          log.error('it handling err', err)
          expect(err).toBeNull()
          log.error('it calling done()')
          done.fail(err)
        }
      )
    })
  })
})
