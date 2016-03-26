// For the Safari and IE 'webcrypto-shim' must be included for example
// per script tag before this code.
import {
  ab2hex,
  str2ab, ab2str,
  ab2base64str, base64str2ab,
  ab2base64urlstr,
  str2utf8ab
} from './ab-utils'

import * as subtle_crypt from './subtle-crypto-utils'

/**
 * Encrypt some plain text with a freshly generated secret.
 *
 * The function returns a promise. The promise resolution is an object
 * containing the secret and the encrypted plaintext.
 * {secret: reduced character set string, encrypted: base64 encoded str}
 *
 * The returned object must be passed into the decrypt method.
 *
 * @param plaintext a string
 * @returns promise
 */
export function encrypt (plaintext) {
  return subtle_crypt.genKeyAndEncrypt(str2ab(plaintext))
    .then(({abIv, abKey, abEncrypted}) => {
      const secret = secrets2str({abIv, abKey})
      return {secret: secret, encrypted: ab2base64str(abEncrypted)}
    })
}

/**
 * Decrypts string encrypted with encrypt function of this module.
 *
 * Returns a promise.
 * @param secret - as returned by encrypt
 * @param encrypted - as returned by encrypt
 * @returns promise
 */
export function decrypt ({secret, encrypted}) {
  const secrets = str2secrets(secret)
  const abEncrypted = base64str2ab(encrypted)
  let parms = Object.assign({}, secrets, {abEncrypted: abEncrypted})
  return subtle_crypt.decrypt(parms).then(abPlaintext => ab2str(abPlaintext))
}

function secrets2str ({abIv, abKey}) {
  const b64Iv = ab2base64str(abIv)
  const b64Key = ab2base64str(abKey)
  return '' + b64Iv + '.' + b64Key
}

function str2secrets (str) {
  const pair = str.split('.')
  if (pair.length !== 2) {
    throw new Error('Expected format of string is <base64>.<base64>')
  }
  const abs = pair.map(base64str2ab)
  return {abIv: abs[0], abKey: abs[1]}
}

/**
 * Compute sha256 digest of string returning hex characters.
 *
 * @param str
 * @returns promise
 */
export function sha256sum (str) {
  return subtle_crypt.sha256(str2utf8ab(str))
    .then(ab2hex)
}

/**
 * Computes sha256 digest of string returning base64url encoded string
 * @param str
 * @returns promise
 */
export function sha256url (str) {
  return subtle_crypt.sha256(str2utf8ab(str))
    .then(ab2base64urlstr)
}

/**
 * Generates nonce for OIDC.
 *
 * This is not a promise.
 *
 * @returns {string}
 */
export function generateNonce () {
  let bytes = new Uint8Array(10)
  window.crypto.getRandomValues(bytes)
  return ab2base64urlstr(bytes).substr(0, 10)
}

