// For the Safari and IE 'webcrypto-shim' must be included for example
// per script tag before this code.
import bows from 'bows'
import {base64urlstr2ab, ascii2ab} from './ab-utils'
import {segments} from './jws-decode'

const log = bows('./subtle_encrypt')

let crypto = window.crypto

// see https://github.com/diafygi/webcrypto-examples
// see http://blog.engelke.com/2014/06/22/symmetric-cryptography-in-the-browser-part-1/

export function generateEncryptionKey () {
  return crypto.subtle.generateKey(
    {name: 'AES-CBC', length: 128},
    true,
    ['encrypt', 'decrypt']
  )
}

function exportEncryptionKey (key) {
  return crypto.subtle.exportKey(
    'raw', key). then(keyData =>
      ({ encryptionKey: key, exportedKey: keyData }))
}

function encryptArrayBuffer ({key, abPlainText}) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  return crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    key.encryptionKey,
    abPlainText).then(encrypted => ({
      abKey: key.exportedKey,
      abIv: iv,
      abEncrypted: encrypted
    }))
}

export function genKeyAndEncrypt (abPlainText) {
  return generateEncryptionKey()
    .then(exportEncryptionKey)
    .then(key => {
      return encryptArrayBuffer({key, abPlainText})
    })
}

function importEncryptionKey (abKeyData) {
  return crypto.subtle.importKey(
    'raw', abKeyData,
    {name: 'AES-CBC'},
    false,
    ['encrypt', 'decrypt']
  )
}

function decryptArrayBuffer ({key, abIv, abEncrypted}) {
  return crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: abIv
    },
    key,
    abEncrypted)
}

export function decrypt ({abKey, abIv, abEncrypted}) {
  return importEncryptionKey(abKey)
    .then(key => {
      return decryptArrayBuffer({key, abIv, abEncrypted})
    })
}

export function sha256 (ab) {
  return crypto.subtle.digest('SHA-256', ab)
}

function omit (obj, ...keysToOmit) {
  const toOmit = new Set(keysToOmit)
  return Object.keys(obj).reduce((a, key) => {
    if (!toOmit.has(key)) a[key] = obj[key]
    return a
  }, {})
}

// jwk is a JWK object not JSON
// as well
// https://github.com/WebKit/webkit/blob/master/LayoutTests/crypto/subtle/rsassa-pkcs1-v1_5-import-jwk.html
function importJWK (jwk) {
  // needed for Edge 13.10586.0 (Windows 10 0.0.0) todo: file issue to see whether this is a bug in edge!
  // https://connect.microsoft.com/IE/feedbackdetail/view/2242108/webcryptoapi-importing-jwk-with-use-field-fails
  let effective_jwk = omit(jwk, 'use') // had added {key_ops: ['verify'], ext: true})
  if (jwk.use && jwk.use !== 'sig') {
    return Promise.reject(new Error(`Expected jwk.use to be 'sig' but it is '${jwk.use}'`))
  }
  return crypto.subtle.importKey(
    'jwk', effective_jwk,
    {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
    true, // extractable
    ['verify']
  )
}

export function verifyJWT (jwkPublic, token) {
  try {
    const jws = segments(token)
    let abData = ascii2ab(jws.header + '.' + jws.payload)
    let abSignature = base64urlstr2ab(jws.signature)

    return importJWK(jwkPublic).then(
      key => {
        return crypto.subtle.verify(
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: {
              name: 'SHA-256'
            }
          },
          key,
          abSignature,
          abData
        ).then(
          verified => {
            if (!verified) {
              throw new Error('Failed to verify token signature.')
            }
            return jws
          }
        )
      },
      err => {
        log('importJWK failed:', err.toString())
        throw err
      }
    )
  } catch (err) {
    log('verifyJWT rejected with err=', err, err.stack)
    return Promise.reject(err)
  }
}

