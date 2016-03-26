/* global crypto, location */

const hasWebcrypto = (
  (typeof crypto !== 'undefined') &&
  (typeof crypto.subtle !== 'undefined'))

// See on why we do not use origin: http://stackoverflow.com/a/6941653

function allowForceFallback () {
  return location.protocol === 'http:' && location.hostname === 'localhost'
}

// todo: make non malleable (configurable, writable): this level looks OK if
// one can assume that crypto and crypto subtle itself are non malleable
// check into callers..
export function getCryptoThingie (webcrypto, {fallback, forceFallback}) {
  if (typeof fallback !== 'undefined') {
    const useFallback = !hasWebcrypto || (allowForceFallback() && forceFallback)
    if (useFallback) {
      return fallback
    }
  }
  return webcrypto
}
