/* eslint-env es6 */
// For the Safari and IE 'webcrypto-shim' must be included for example
// per script tag before this code.
import {verifyJWT} from './subtle-crypto-utils'
import {decodeSegment} from './jws-decode'
import bows from 'bows'

const log = bows('webcryptovalidate')

/**
 * Validate tokens
 */
export function validateAndParseToken (jwk, token) {
  const p = Promise.resolve(undefined)
  if (!token) {
    return p
  } else {
    log.debug('validateAndParseToken(): entering with token:', token)
    return p
      .then(() => {
        return verifyJWT(jwk, token)
      })
      .then(token => {
        log.debug('validateAndParseToken() token verified, now decoding:', token)
        return decodeSegment(token.payload)
      })
  }
}
