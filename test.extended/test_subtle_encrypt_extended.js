/* eslint-env jasmine */
/* eslint-disable quotes */
import * as se from '../src/subtle-crypto-utils'
import {ab2base64urlstr, ascii2ab} from '../src/ab-utils'
import {encodeJWSSegment} from '../test/tlib'
import * as testData from '../test/test-data'
import bows from 'bows'

const log = bows('Anvil Test')

// localStorage.debug = true triggers log statements

describe('Check jwk sign verification', () => {
  describe('self generated key', () => {
    // Signing failed for me on Safari 9.0.2 on OS-X
    // https://github.com/vibornoff/webcrypto-shim master from 1/10/2016
    // all other tests pass however.
    let result = {}
    let token = testData.jwt_token
    let encodedToken = {
      header: encodeJWSSegment(token.header),
      payload: encodeJWSSegment(token.payload)
    }

    const wcs = window.crypto.subtle

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
            pubKey => { result.jwtPubKey = pubKey },
            err => log.debug('Gen or export public key failed:', err, err.stack)
          ).then(wcs.exportKey('jwk', k.privateKey)
          ).then(
            privKey => { result.jwtPrivKey = privKey },
            err => log.debug('Gen or export private key failed:', err, err.stack)
          )
      }).then(() => {
        log.debug('Exported public key:', result.jwtPubKey)
        log.debug('Exported private key:', result.jwtPrivKey)
      }).then(() => {
        const tokenParts = encodedToken.header + '.' + encodedToken.payload

        return wcs.sign(
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: {name: 'SHA-256'}
          },
          result.ppkey.privateKey,
          ascii2ab(tokenParts))
          .then(signature => {
            result.signature = ab2base64urlstr(signature)
            log.debug('signature= ', result.signature)
            result.token = `${encodedToken.header}.${encodedToken.payload}.${result.signature}`
            log.debug(`jws= ${result.token}`)
            return result.token
          })
      }).then(token => {
        return se.verifyJWT(result.jwtPubKey, token).then(res => {
          log.debug('se.verifyJWT fulfilled', res)
        })
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
          done()
        }
      )
    })
  })
})

