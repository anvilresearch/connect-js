/* eslint-env es6 */
/* global localStorage */

import Anvil from './anvil-connect'
import bows from 'bows'

var log = bows('Anvil jwks')

export var jwk

/**
 * Set JWK
 */
export function setJWK (jwks) {
  var key = 'anvil.connect.jwk'

  // Recover from localStorage.
  if (!jwks) {
    try {
      jwk = JSON.parse(localStorage[key])
    } catch (e) {
      log('Cannot deserialized JWK', e)
    }
  }

  // Argument is a naked object.
  if (!Array.isArray(jwks) && typeof jwks === 'object') {
    jwk = jwks
  }

  // Argument is an array of JWK objects.
  // Find the key for verifying signatures.
  if (Array.isArray(jwks)) {
    jwks.forEach(function (obj) {
      if (obj && obj.use === 'sig') {
        jwk = obj
      }
    })
  }

  if (jwk) {
    // provider.jwk = jwk
    localStorage[key] = JSON.stringify(jwk)
  }
  return jwk
}

/*
 * Fetch public jwk keys if needed.
 *
 * Returns a promise.
 */
export function prepareKeys () {
  var jwk = setJWK() // reads from local storage
  if (jwk) {
    // Return promise also if keys are already in local storage
    return Promise.resolve()
  } else {
    return getKeys()
  }
}

function getKeys () {
  var apiHttp = Anvil.apiHttp
  return Anvil.promise.request({
    method: 'GET',
    url: Anvil.issuer + '/jwks',
    crossDomain: true
  }).then(response => {
    setJWK(response && apiHttp.getData(response) &&
      apiHttp.getData(response).keys)
    return response
  })
}

