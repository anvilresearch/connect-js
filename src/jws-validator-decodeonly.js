/* eslint-env es6 */

// WARNING: jwt tokes are not validated by this module!
//
// JavaScript inside a browser cannot be
// locked down to ensure only trusted code runs and an attacker
// can take advantage of this to disable any crypto we might put in place
// here.
// Some believe that all browser crypto is futile.
//
// But cryto can help against other attacks such as
// cross-site request forgery and also accessing and stealing
// information from the Browsers local storage.
//
// This is used that tokens were just received from the server which
// in production must happen over SSL.
// For situations where validating the just received token
// in the browser seems the top this version can be used.
//
// This code does not come with the crypto dependencies required for
// validating the tokens and may be useful for a certain class of browser
// applications.

'use strict'  // ES6 modules are strict but may be safer for transpiling perhaps

import * as jws from './jws-decode'

export const noJWKrequired = true // default if absent is to require key

/**
 * Validate tokens
 */
export function validateAndParseToken (jwk, token) {
  // If this turns out to be a strategy widely deployed we may
  // optimize the caller to not require the jwk
  const p = Promise.resolve(undefined)
  return p.then(() => {
    const t = jws.segments(token)
    const claims = jws.decodeSegment(t.payload)
    return Promise.resolve(claims)
  })
}
