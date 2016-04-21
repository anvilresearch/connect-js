/* eslint-env jasmine */
/* eslint-disable quotes */

import 'webcrypto-shim'
import * as encryptor from '../src/encryptor-webcrypto'

describe('test encryptor-webcrypto module: specific webcrypto tests', () => {
  describe('test decrypt with well known values', () => {
    let result = {}
    let decrypt_input = {
      secret: '4VeyLKr0tJcMVAMS2cNRZw==.8919jCYXdb6tu7p6s4SPkg==',
      encrypted: '3tcxKrp65OvwYdXp2oPi/g=='
    }

    beforeEach(done => {
      encryptor.decrypt(decrypt_input).then(r => {
        result.plaintext = r
        done()
      }).catch(err => {
        result.err = err
        done()
      })
    })
    it('should not report an error', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should have expected values', () => {
      expect(result.plaintext).toEqual('secret')
    })
  })
})
