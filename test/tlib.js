import {str2utf8ab, ab2base64urlstr} from '../src/ab-utils'
import {sha256sum} from '../src/encryptor-webcrypto'

export function encodeJWSSegment (jsonObject) {
  const json = JSON.stringify(jsonObject)
  const abUtf8 = str2utf8ab(json)
  const b64url = ab2base64urlstr(abUtf8)
  return b64url
}

export function atHash (token) {
  /* http://openid.net/specs/openid-connect-implicit-1_0.html#rfc.section.2.2.2
   Its value is the base64url encoding of the left-most half of the hash of the octets of the ASCII representation of the access_token value, where the hash algorithm used is the hash algorithm used in the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, hash the access_token value with SHA-256, then take the left-most 128 bits and base64url-encode them. The at_hash value is a case-sensitive string.
   */
  // note the caller will already have decoded the base64url id_token claim
  // at_hash so that is in hex
  return sha256sum(token).then(sha256 => {
    return sha256.slice(0, sha256.length / 2)
  })
}

export function omit (obj, ...keysToOmit) {
  const toOmit = new Set(keysToOmit)
  return Object.keys(obj).reduce((a, key) => {
    if (!toOmit.has(key)) a[key] = obj[key]
    return a
  }, {})
}
