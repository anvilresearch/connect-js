/* eslint-env jasmine */
/* global localStorage */

import * as jwks from '../src/jwks'

describe('setJWK', () => {
  describe('with empty argument', () => {
    var jwk
    beforeEach(() => {
      jwk = {
        kid: 'empty',
        kty: 'TEST',
        use: 'sig',
        alg: 'WTF',
        n: 'h3xh3xh3x',
        e: 'h3x'
      }
      localStorage['anvil.connect.jwk'] = JSON.stringify(jwk)
      jwks.setJWK()
    })

    it('should serialize the JWK in localStorage', () => {
      expect(localStorage['anvil.connect.jwk']).toEqual(JSON.stringify(jwk))
    })

    it('should set the jwk on the provider', () => {
      expect(jwks.jwk).toEqual(jwk)
    })
  })

  describe('with object argument', () => {
    var jwk
    beforeEach(() => {
      jwk = {
        kid: 'object',
        kty: 'TEST',
        use: 'sig',
        alg: 'WTF',
        n: 'h3xh3xh3x',
        e: 'h3x'
      }
      jwks.setJWK(jwk)
    })

    it('should serialize the JWK in localStorage', () => {
      expect(localStorage['anvil.connect.jwk']).toBe(JSON.stringify(jwk))
    })

    it('should set the jwk on the provider', () => {
      expect(jwks.jwk).toBe(jwk)
    })
  })

  describe('with array argument', () => {
    var jwk
    beforeEach(() => {
      jwk = {
        kid: 'object',
        kty: 'TEST',
        use: 'sig',
        alg: 'WTF',
        n: 'h3xh3xh3x',
        e: 'h3x'
      }
      jwks.setJWK([jwk])
    })

    it('should serialize the JWK in localStorage', () => {
      expect(localStorage['anvil.connect.jwk']).toBe(JSON.stringify(jwk))
    })

    it('should set the jwk on the provider', () => {
      expect(jwks.jwk).toBe(jwk)
    })

    // it('should set the modulus on the provider', () => {
    //   expect(AnvilProvider.hN).toBe b64tohex(jwk.n)
    // })
    //
    // it('should set the exponent on the provider', () => {
    //   expect(AnvilProvider.hE).toBe b64tohex(jwk.e)
    // })
  })
})
