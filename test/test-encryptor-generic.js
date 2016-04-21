/* eslint-env jasmine */
/* eslint-disable quotes */

import 'webcrypto-shim'
import * as encryptor from '../src/encryptor-webcrypto'

describe('test encryptor-webcrypto module: generic tests', () => {
  describe('test encrypt decrypt cycle', () => {
    let result = {}
    let plaintext = 'secret'

    beforeEach(done => {
      encryptor.encrypt(plaintext).then(r => {
        return encryptor.decrypt(r)
      }).then(decrypted => {
        result.decrypted = decrypted
        done()
      }).catch(err => {
        result.err = err
        done.fail(err)
      })
    })

    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should produce original plaintext', () => {
      expect(result.decrypted).toBe(plaintext)
    })
  })
  describe('test encrypt produces uniques results', () => {
    let result = {}
    let plaintext = 'secret'

    beforeEach(done => {
      result.encrypted = []
      Promise.all([encryptor.encrypt(plaintext), encryptor.encrypt(plaintext)])
      .then(arr => {
        result.encrypted = arr
        done()
      }).catch(err => {
        result.err = err
        done.fail(err)
      })
    })

    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should produce two results', () => {
      expect(result.encrypted.length).toBe(2)
    })
    it('results should differ from each other', () => {
      expect(result.encrypted[0].secret).not.toEqual(result.encrypted[1].secret)
      expect(result.encrypted[0].encrypted).not.toEqual(result.encrypted[1].encrypted)
    })
    it('results should be strings', () => {
      // expect({a: 42}).toEqual(jasmine.any(String)) this fails which is as expected
      for (let r of result.encrypted) {
        expect(r.secret).toEqual(jasmine.any(String))
        expect(r.encrypted).toEqual(jasmine.any(String))
      }
    })
  })

  describe('test sha256sum', () => {
    let result = {}
    beforeEach(done => {
      encryptor.sha256sum('hello').then(r => {
        result.sha256sum = r
        done()
      }).catch(err => {
        result.err = err
        done.fail(err)
      })
    })
    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should have expected values', () => {
      expect(result.sha256sum).toEqual('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    })
  })

  describe('test sha256url', () => {
    let result = {}
    beforeEach(done => {
      encryptor.sha256url('hello').then(r => {
        result.sha256url = r
        done()
      }).catch(err => {
        result.err = err
        done.fail(err)
      })
    })
    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should have expected values', () => {
      expect(result.sha256url).toEqual('LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ')
    })
  })

  describe('test generateNonce', () => {
    let result = {}
    beforeEach(() => {
      result.nonces = []
      result.nonces.push(encryptor.generateNonce())
      result.nonces.push(encryptor.generateNonce())
    })
    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should produce two nonces', () => {
      expect(result.nonces.length).toBe(2)
    })
    it('two nonces should differ (practically always)', () => {
      expect(result.nonces[0]).not.toEqual(result.nonces[1])
    })
    it('should only contain base64url characters)', () => {
      for (let n of result.nonces) {
        expect(n).toMatch(/^[a-zA-Z0-9_\-]{10}$/)
      }
    })
  })
})
