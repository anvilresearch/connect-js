import * as jwtvalidator_webcrypto from './jws-validator-webcrypto'
import * as encryptor_webcrypto from './encryptor-webcrypto'
import * as nowebcrypto_fallback from './nowebcrypto_fallback'

let jwtvalidator = jwtvalidator_webcrypto
let encryptor = encryptor_webcrypto

const ourmodule = {}

// ensure the crypto algorithms can't be easily changed
// properties are defined to be:
// not writable and not configurable by defaults
// also no setter.
Object.defineProperty(ourmodule, 'encryptor', {
  get: function () {
    return encryptor
  },
  enumerable: true
})

Object.defineProperty(ourmodule, 'jwtvalidator', {
  get: function () {
    return jwtvalidator
  },
  enumerable: true
})

Object.defineProperty(ourmodule, 'setNoWebCryptoFallbacks', {
  get: function () {
    return setNoWebCryptoFallbacks
  },
  enumerable: true
})

/**
 * Sets fallback code in case webcrypto is not available.
 *
 * The determination whether webcrypto is available is made based on
 * the existence of 'crypto.subtle'.
 *
 * One can provide a fallback for an encryptor and a JWT validator.
 *
 * The encryptor API can be seen in encryptor-webcrypto.js and associated
 * unit tests.
 * Likewise the JTW validator API is demonstrated in jws-validator-webcrypto.js
 *
 * To avoid malicious code taking over all crypto code by changing to
 * cryptors, these are ONLY used if webcrypto APIs are not available as
 * determined by the presence of the crypto.subtle global interface being
 * defined.
 *
 * For unit testing cryptors when the origin is at http://localhost:<any-port>
 * one can use forceFallback to replace the normal web crypto based adapters.
 * In this case set forceFallback truthy.
 *
 * To restore the original cryptors the following call can be made:
 * setNoWebCryptoFallbacks({encryptorOptions: {}, jwtvalidatorOptions: {})
 *
 * @param encryptorOptions optional: { fallback, forceFallback }
 * @param jwtvalidatorOptions optional: { fallback, forceFallback }
 */
function setNoWebCryptoFallbacks ({
  encryptorOptions,
  jwtvalidatorOptions}) {
  if (encryptorOptions) {
    encryptor = nowebcrypto_fallback.getCryptoThingie(
      encryptor_webcrypto, encryptorOptions)
  }
  if (jwtvalidatorOptions) {
    jwtvalidator = nowebcrypto_fallback.getCryptoThingie(
      jwtvalidator_webcrypto, jwtvalidatorOptions)
  }
}

export default ourmodule
