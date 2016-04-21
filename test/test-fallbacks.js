/* eslint-env jasmine */
import 'webcrypto-shim'
import fallbacks from '../src/cryptors-with-fallbacks'

const original_encryptor = fallbacks.encryptor
const original_jwtvalidator = fallbacks.jwtvalidator
const original_setNoWebCryptoFallbacks = fallbacks.setNoWebCryptoFallbacks
const dummy1 = {whoami: 'dummy1'}
const dummy2 = {whoami: 'dummy2'}

describe('test fallback mechanism', () => {
  describe('encryptor tests', () => {
    it('we expect the platform to define crypto.subtle and the original encryptor to stay active', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1}})
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
    it('unless we force the fallback to be active with a truthy value', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1, forceFallback: 'thruthy-right'}})
      expect(fallbacks.encryptor).toBe(dummy1)
    })
    it('calling again should reset the the original webcrypto provider', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1}})
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
    it('calling again with a missing fallback should do the same', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {forceFallback: 'thruthy-right'}})
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
    it('calling again with an empty object should also work', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {}})
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
    it('calling again with an empty object should also work', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: {fallback: dummy1, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {encryptorOptions: 'foo'})
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
  })

  describe('validator tests', () => {
    afterEach(() => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {}, encryptorOptions: {}})
    })
    it('we expect the platform to define crypto.subtle and the original jwtvalidator to stay active', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2}})
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('unless we force the fallback to be active with a truthy value', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2, forceFallback: 'thruthy-right'}})
      expect(fallbacks.jwtvalidator).toBe(dummy2)
    })
    it('calling again should reset the the original webcrypto provider', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2}})
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('calling again with a missing fallback should do the same', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {forceFallback: 'thruthy-right'}})
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('calling again with an empty object should also work', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {}})
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('calling again with an empty object should also work', () => {
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: {fallback: dummy2, forceFallback: 'thruthy-right'}})
      fallbacks.setNoWebCryptoFallbacks(
        {jwtvalidatorOptions: 'foo'})
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('cannot simply overwrite jwtvalidator', () => {
      var shouldThrow = function foo () {
        fallbacks.jwtvalidator = 'dah'
      }
      expect(shouldThrow).toThrow()
      expect(fallbacks.jwtvalidator).toBe(original_jwtvalidator)
    })
    it('cannot simply overwrite encryptor', () => {
      var shouldThrow = function () {
        fallbacks.encryptor = 'dah'
      }
      expect(shouldThrow).toThrow()
      expect(fallbacks.encryptor).toBe(original_encryptor)
    })
    it('cannot simply overwrite setNoWebCryptoFallbacks()', () => {
      var shouldThrow = function () {
        fallbacks.setNoWebCryptoFallbacks = function () {}
      }
      expect(shouldThrow).toThrow()
      expect(fallbacks.setNoWebCryptoFallbacks).toBe(original_setNoWebCryptoFallbacks)
    })
  })
})
