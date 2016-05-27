/* eslint-env es6 */
/* global TextEncoder, TextDecoder */

import * as base64 from 'base64-js'
import 'text-encoder-lite'
// see jsperf.com/hex-conversion

const hexChars = '0123456789abcdef'
const hexEncodeArray = hexChars.split('')

export function ab2hex (ab) {
  let arr = new Uint8Array(ab)
  let s = ''
  for (var i = 0, n = ab.byteLength; i < n; i++) {
    const byte = arr[i]
    s += hexEncodeArray[byte >>> 4]
    s += hexEncodeArray[byte & 0x0f]
  }
  return s
}

function hexdigit (c) {
  const i = hexChars.indexOf(c)
  if (i < 0) {
    throw new Error(`Character '${c}' is not a valid hex character: expected '${hexChars}'`)
  }
  return i
}

export function hex2ab (hexstr) {
  const len = hexstr.length
  if (len % 2 !== 0) {
    throw new Error(`hex string '${hexstr} 'is expected to have even number of hex characters`)
  }
  const buflen = len >>> 1
  const buf = new ArrayBuffer(buflen)
  const view = new Uint8Array(buf)

  let i = 0
  let rest = hexstr
  while (rest.length > 0) {
    let [d1, d0, ... newrest] = rest  // rest parameter must not be the same as already existing variable
    // d0 === undefined should be handled by throw above.
    let n = hexdigit(d1) * 16 + hexdigit(d0)
    view[i++] = n
    rest = newrest
  }
  return buf
}

// see devnotes.md for more on why we use TextEncoder(Lite) for UTF-8
// conversions.

export function str2utf8ab (str) {
  return new TextEncoder('utf-8').encode(str)
}

export function abutf82str (ab) {
  return new TextDecoder('utf-8').decode(ab)
}

export function str2ab (str) {
  const strlen = str.length
  let buf = new ArrayBuffer(strlen * 2)
  let view = new Uint16Array(buf)
  for (var i = 0; i < strlen; i++) {
    view[i] = str.charCodeAt(i)
    // don't use charAt(i) here.
  }
  return buf
}

export function ab2str (ab) {
  return String.fromCharCode.apply(null, new Uint16Array(ab))
}

export function ascii2ab (str) {
  const strlen = str.length
  let buf = new ArrayBuffer(strlen)
  let view = new Uint8Array(buf)
  for (var i = 0; i < strlen; i++) {
    const cc = str.charCodeAt(i)
    if (cc > 127) {
      throw new Error(`String contains non ascii characters: charCode = '${cc}' at index '${i}'`)
    }
    view[i] = cc
  }
  return buf
}

export function ab2ascii (ab) {
  const view = new Uint8Array(ab)
  const len = view.length
  let s = ''
  for (var i = 0; i < len; i++) {
    const cc = ab[i]
    if (cc > 127) {
      throw new Error(`String contains non ascii characters: charCode = '${cc}' at index '${i}'`)
    }
    s += String.fromCharCode(cc)
  }
  return s
}

export function base64str2ab (base64str) {
  return base64.toByteArray(base64str)
}

export function ab2base64str (buf) {
  return base64.fromByteArray(new Uint8Array(buf))
}

export function base64urlstr2ab (base64urlstr) {
  // Decode url-safe style base64: https://github.com/beatgammit/base64-js/pull/10
  // however '=' padding characters must be added, if needed
  let str = base64urlstr
  let npad = 4 - str.length % 4
  if (npad === 4) {
    npad = 0
  }
  str = (str + '===').slice(0, str.length + npad)
  return base64.toByteArray(str)
}

export function ab2base64urlstr (buf) {
  const str = base64.fromByteArray(new Uint8Array(buf))
  // '=' is percent encoded in an URL so strip this:
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
