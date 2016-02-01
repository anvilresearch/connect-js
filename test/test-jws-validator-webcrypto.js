/* eslint-env jasmine */
/* eslint-disable quotes */
import 'webcrypto-shim'
import * as jwtvalidator from '../src/jws-validator-webcrypto.js'
import * as testData from './test-data'

describe('Check jws-validator', () => {
  const key = {
    jwk: testData.real_data.jwk
  }

  const token = testData.access_token_encoded

  describe('verifies a good token', () => {
    let result = {}

    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, token).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done.fail(err)
        }
      )
    })

    it('should not reject the promise', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should fulfill with the claims', () => {
      expect(Object.keys(result.claims)).toEqual(["jti", "iss", "sub", "aud", "exp", "iat", "scope"])
      const expected = testData.access_token.payload
      expect(result.claims.aud).toEqual(expected.aud)
      expect(result.claims.exp).toEqual(expected.exp)
      expect(result.claims.iat).toEqual(expected.iat)
      expect(result.claims.iss).toEqual(expected.iss)
      expect(result.claims.jti).toEqual(expected.jti)
      expect(result.claims.scope).toEqual(expected.scope)
      expect(result.claims.sub).toEqual(expected.sub)
    })
  })

  describe('reject a bad token', () => {
    let result = {}
    const badToken = testData.access_token_encoded_bad_signature
    // badToken can be logged in test-subtle-encrypt
    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, badToken).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done()
        }
      )
    })

    it('should reject the promise', () => {
      expect(result.err).toBeDefined()
    })
  })
  describe('reject an alg=none', () => {
    let result = {}
    const algNoneToken = testData.access_token_encoded_alg_none
    // algNoneToken can be logged in test-subtle-encrypt
    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, algNoneToken).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done()
        }
      )
    })

    it('should reject the promise', () => {
      expect(result.err).toBeDefined()
    })
  })
})

