/* eslint-env es6 */
/* global localStorage */

import bows from 'bows'
import TinyEmitter from 'tiny-emitter'
import * as jwks from './jwks'
import cryptors from './cryptors-with-fallbacks'

let log = bows('Anvil')

let session = {}
let Anvil = {
  promise: {}
}

// All init functions below must be called!
/**
 * TODO: update comment.
 * Init function used for http requests.
 * Function is called with a config object as first parameter with
 * fields:
 *    method
 *    url
 *    crossDomain
 *    headers
 *
 *  It is expected to return a promise.
 */
function initHttpAccess (http) {
  if (http && typeof http === 'object' &&
    typeof http.request === 'function' &&
    typeof http.getData === 'function') {
    Anvil.apiHttp = http
  } else {
    throw new Error("Must pass in object with functions in fields: 'request', 'getData'.")
  }
}

Anvil.initHttpAccess = initHttpAccess

/**
 *  Init functions for location access.
 */
function initLocationAccess (loc) {
  if (loc && typeof loc === 'object' &&
    typeof loc.hash === 'function' &&
    typeof loc.path === 'function') {
    Anvil.locAccess = loc
    return
  }
  throw new Error("Must pass in object with functions in fields: 'hash', 'path'.")
}
Anvil.initLocationAccess = initLocationAccess

/**
 *  Init functions for DOM/window access.
 */
function initDOMAccess (da) {
  if (da && typeof da === 'object' &&
    typeof da.getWindow === 'function' &&
    typeof da.getDocument === 'function') {
    Anvil.domAccess = da
    return
  }
  throw new Error("Must pass in object with functions in fields: 'getWindow', 'getDocument'.")
}
Anvil.initDOMAccess = initDOMAccess

/**
 * Extend
 */

function extend () {
  var target = arguments[0]

  // iterate over arguments, excluding the first arg
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]

    // iterate through properties, copying to target
    for (var prop in source) {
      if (source[prop] !== undefined) { target[prop] = source[prop] }
    }
  }

  return target
}

/**
 * Support events, e.g. 'authenticated'
 *
 * The 'authenticated' event is emitted in response to a
 * local storage 'anvil.connect' event when the user is authenticated.
 *
 * This can be leveraged to react to an authentiation performed in
 * other windows or tabs.
 */
extend(Anvil, TinyEmitter.prototype)

/**
 * Provider configuration
 */
function configure (options) {
  var params
  Anvil.issuer = options.issuer
  jwks.setJWK(options.jwk)

  Anvil.params = params = {}
  params.response_type = options.response_type || 'id_token token'
  params.client_id = options.client_id
  params.redirect_uri = options.redirect_uri
  params.scope = [
    'openid',
    'profile'
  ].concat(options.scope).join(' ')
  Anvil.display = options.display || 'page'
}

Anvil.configure = configure

function init (providerOptions, apis) {
  if (providerOptions) {
    Anvil.configure(providerOptions)
  }

  Anvil.initHttpAccess(apis.http)

  Anvil.initLocationAccess(apis.location)

  Anvil.initDOMAccess(apis.dom)

  // todo: perhaps this should be in its own method
  apis.dom.getWindow().addEventListener('storage', Anvil.updateSession, true)
}

Anvil.init = init

Anvil.setNoWebCryptoFallbacks = cryptors.setNoWebCryptoFallbacks

/**
 * Do initializations which may require network calls.
 *
 * returns a promise.
 */

function prepareAuthorization () {
  return jwks.prepareKeys()
    .then(function (val) {
      log.debug('prepareAuthorization() succeeded.', val)
      return val
    }, function (err) {
      log.warn('prepareAuthorization() failed:', err.stack)
      throw err
    })
}

Anvil.promise.prepareAuthorization = prepareAuthorization

/**
 * Form Urlencode an object
 */

function toFormUrlEncoded (obj) {
  var pairs = []

  Object.keys(obj).forEach(function (key) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
  })

  return pairs.join('&')
}

Anvil.toFormUrlEncoded = toFormUrlEncoded

/**
 * Parse Form Urlencoded data
 */

function parseFormUrlEncoded (str) {
  var obj = {}

  str.split('&').forEach(function (property) {
    var pair = property.split('=')
    var key = decodeURIComponent(pair[0])
    var val = decodeURIComponent(pair[1])

    obj[key] = val
  })

  return obj
}

Anvil.parseFormUrlEncoded = parseFormUrlEncoded

/**
 * Get URI Fragment
 */

function getUrlFragment (url) {
  return url.split('#').pop()
}

Anvil.getUrlFragment = getUrlFragment

/**
 * Configure the authorize popup window
 * Adapted from dropbox-js for ngDropbox
 */

function popup (popupWidth, popupHeight) {
  var x0, y0, width, height, popupLeft, popupTop

  var window = Anvil.domAccess.getWindow()
  var documentElement = Anvil.domAccess.getDocument().documentElement

  // Metrics for the current browser win.
  x0 = window.screenX || window.screenLeft
  y0 = window.screenY || window.screenTop
  width = window.outerWidth || documentElement.clientWidth
  height = window.outerHeight || documentElement.clientHeight

  // Computed popup window metrics.
  popupLeft = Math.round(x0) + (width - popupWidth) / 2
  popupTop = Math.round(y0) + (height - popupHeight) / 2.5
  if (popupLeft < x0) { popupLeft = x0 }
  if (popupTop < y0) { popupTop = y0 }

  return 'width=' + popupWidth + ',height=' + popupHeight + ',' +
  'left=' + popupLeft + ',top=' + popupTop + ',' +
  'dialog=yes,dependent=yes,scrollbars=yes,location=yes'
}

Anvil.popup = popup

/**
 * Session object
 */

Anvil.session = session

/**
 * Serialize session
 */

function serialize () {
  log.debug('serialize(): entering')
  let plaintext = JSON.stringify(Anvil.session)
  return cryptors.encryptor.encrypt(plaintext).then(({secret, encrypted}) => {
    var now = new Date()
    var time = now.getTime()
    var exp = time + (Anvil.session.expires_in || 3600) * 1000

    now.setTime(exp)
    Anvil.domAccess.getDocument().cookie = 'anvil.connect=' + secret +
      '; expires=' + now.toUTCString()

    log.debug('serialize() stored secret in COOKIE anvil.connect')
    localStorage['anvil.connect'] = encrypted
    log.debug('serialize() stored encrypted session data in local storage anvil.connect')
    localStorage['anvil.connect.session.state'] = Anvil.sessionState
    log.debug('serialize() stored sessionState data in local storage anvil.connect.session.state')
  }).catch(err => {
    log.debug('serialize failed with error:', err, err.stack)
    throw err
  })
}

Anvil.promise.serialize = serialize

/**
 * Deserialize session
 */
function deserialize () {
  var parsed

  let dom = Anvil.domAccess.getDocument()
  const p = new Promise(function (resolve) {
    // Use the cookie value to decrypt the session in localStorage
    // Exceptions may occur if data is unexpected or there is no
    // session data yet.
    // An exception will reject the promise
    const re = /\banvil\.connect=([^\s;]*)/
    const secret = dom.cookie.match(re).pop()
    const encrypted = localStorage['anvil.connect']
    let parms = Object.assign({}, {
      secret: secret,
      encrypted: encrypted})
    resolve(parms)
  })

  return p.then(parms => {
    return cryptors.encryptor.decrypt(parms).then(plaintext => {
      // exceptions when parsing json causes the promise to be rejected
      return JSON.parse(plaintext)
    })
  }).then(parsed => {
    log.debug('Deserialized session data', parsed.userInfo)
    Anvil.session = session = parsed
    Anvil.sessionState = localStorage['anvil.connect.session.state']
    return session
  }).then(session => {
    Anvil.emit('authenticated', session) // todo: may need to emitted on failure also
    return session
  }).catch(e => {
    log.debug('Cannot deserialize session data', e)
    Anvil.session = session = parsed || {}
    Anvil.sessionState = localStorage['anvil.connect.session.state']
  })
}

Anvil.promise.deserialize = deserialize

/**
 * Reset
 */

function reset () {
  log.debug('reset() called: clearing session')
  Anvil.session = session = {}
  Anvil.domAccess.getDocument().cookie = 'anvil.connect=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  delete localStorage['anvil.connect']
}

Anvil.reset = reset

/**
 * Quick and dirty uri method with nonce (returns promise)
 */

function uri (endpoint, options) {
  return Anvil.promise.nonce().then(nonce => {
    return Anvil.issuer + '/' +
      (endpoint || 'authorize') + '?' +
      toFormUrlEncoded(extend({}, Anvil.params, options, {
        nonce: nonce
      }))
  })
}

Anvil.promise.uri = uri

/**
 * Create or verify a nonce
 */
function nonce (nonce) {
  if (nonce) {
    var lnonce = localStorage['nonce']
    if (!lnonce) {
      return Promise.resolve(false)
    }
    return Anvil.promise.sha256url(localStorage['nonce']).then(val => val === nonce)
  } else {
    localStorage['nonce'] = cryptors.encryptor.generateNonce()
    return Anvil.promise.sha256url(localStorage['nonce'])
  }
}

Anvil.promise.nonce = nonce

/**
 * Base64url encode a SHA256 hash of the input string
 *
 * @param str
 * @returns {promise}
 */
function sha256url (str) {
  return cryptors.encryptor.sha256url(str)
}

Anvil.promise.sha256url = sha256url

/**
 * Headers
 */

function headers (headers) {
  if (Anvil.session.access_token) {
    return extend(headers || {}, {
      'Authorization': 'Bearer ' + Anvil.session.access_token
    })
  } else {
    return headers
  }
}

Anvil.headers = headers

/**
 * Request
 */

function request (config) {
  config.headers = Anvil.headers(config.headers)
  config.crossDomain = true
  return Promise.resolve(Anvil.apiHttp.request(config)
    .then(function (val) {
      log.debug('request() succeeded.', config)
      return val
    }, function (err) {
      log.warn('request() failed:', config, err.stack)
      throw err
    }))
}

Anvil.promise.request = request

/**
 * UserInfo
 */

function userInfo () {
  return Anvil.promise.request({
    method: 'GET',
    url: Anvil.issuer + '/userinfo',
    crossDomain: true
  })
}

Anvil.promise.userInfo = userInfo

// this is just a sketch
function validateClaims (claims) {
  if (!claims) {
    return claims
  }
  const now = new Date() / 1000
  const {iat, exp, iss, aud} = claims
  if (!exp) {
    throw new Error('token must have exp')
  }
  if (!iat) {
    throw new Error('token must have iat')
  }
  if (!iss) {
    throw new Error('token must have iss')
  }
  if (!aud) {
    throw new Error('token must have aud')
  }
  if (typeof exp !== 'number') {
    throw new Error('token must have exp of type number')
  }
  if (typeof iat !== 'number') {
    throw new Error('token must have iat of type number')
  }
  if (now > exp) {
    throw new Error('token is expired.')
  }
  if (iat > now) {
    throw new Error('token invalid: issued at is in the future.')
  }
  if (iss !== Anvil.issuer) {
    throw new Error(`token iss '${iss}' does not match '${Anvil.issuer}'`)
  }
  if (aud !== Anvil.params.client_id) {
    throw new Error(`token aud '${aud}' does not match '${Anvil.params.client_id}'`)
  }
  return claims
}

/**
 * Callback
 */

function callback (response) {
  log.debug('callback(): entering')
  if (response.error) {
    log.debug('callback(): with error=', response.error)
    // clear localStorage/cookie/etc
    Anvil.sessionState = response.session_state
    localStorage['anvil.connect.session.state'] = Anvil.sessionState
    Anvil.reset()
    return Promise.reject(response.error)
  } else {
    log.debug('callback(): on response=', response)
    // NEED TO REVIEW THIS CODE FOR SANITY
    // Check the conditions in which some of these verifications
    // are skipped.
    let apiHttp = Anvil.apiHttp

    const jwtvalidator = cryptors.jwtvalidator

    return Promise.resolve()
      // 0. ensure there is a jwk unless jwtvalidator does not need it.
      .then(() => {
        if (!jwtvalidator.noJWKrequired && !jwks.jwk) {
          throw new Error('You must call and fulfill Anvil.prepareAuthorization() before attempting to validate tokens')
        }
      })
      // 1. validate/parse access token
      .then(() => {
        log.debug('callback(): validateAndParseToken access token:', response.access_token)
        return jwtvalidator.validateAndParseToken(jwks.jwk, response.access_token)
      })
      .then(claims => {
        return validateClaims(claims)
      })
      .catch(e => {
        log.debug('Exception validating access token', e.toString())
        throw new Error('Failed to verify or parse access token')
      })
      .then(claims => {
        log.debug('callback(): settings response.access_claims', claims)
        response.access_claims = claims
      })
      // 2. validate/parse id token
      .then(() => {
        log.debug('callback(): validateAndParseToken id token:', response.id_token)
        return jwtvalidator.validateAndParseToken(jwks.jwk, response.id_token)
      })
      .then(claims => {
        return validateClaims(claims)
      })
      .catch(e => {
        log.debug('Exception validating id token', e.toString())
        throw new Error('Failed to verify or parse id token')
      })
      .then(claims => {
        log.debug('callback(): settings response.id_claims', claims)
        response.id_claims = claims
      })
      // 3. validate nonce
      .then(() => {
        log.debug('callback(): validating nonce..')
        if (response.id_claims) {
          return Anvil.promise.nonce(response.id_claims.nonce)
        } else {
          return true
        }
      }).then(nonceIsValid => {
        log.debug('callback(): nonceIsValid=', nonceIsValid)
        if (!nonceIsValid) {
          throw new Error('Invalid nonce.')
        }
      })
      // 4. Verify at_hash
      .then(() => {
        log.debug('callback(): validating at hash')
        if (['id_token token'].indexOf(Anvil.params.response_type) !== -1) {
          return cryptors.encryptor.sha256sum(response.access_token)
            .then(atHash => {
              atHash = atHash.slice(0, atHash.length / 2)
              if (response.id_claims && atHash !== response.id_claims.at_hash) {
                throw new Error('Invalid access token hash in id token payload')
              }
            })
        }
      })
      // If 1-4 check out establish session:
      .then(() => {
        Anvil.session = response
        Anvil.sessionState = response.session_state
        log.debug('callback(): session state=', Anvil.sessionState)
      })
      // and retrieve user info
      .then(() => {
        log.debug('callback(): retrieving user info')
        return Anvil.promise.userInfo().catch(e => {
          log.debug('userInfo() retrieval failed with', e)
          throw new Error('Retrieving user info from server failed.')
        })
      })
      .then(userInfoResponse => {
        let userInfo = apiHttp.getData(userInfoResponse)
        log.debug('callback(): setting user info', userInfo)
        Anvil.session.userInfo = userInfo
        return Anvil.promise.serialize()
      })
      .then(() => {
        log.debug('callback(): emitting authenticated:', Anvil.session)
        Anvil.emit('authenticated', Anvil.session)
        return Anvil.session
      })
      .catch(e => {
        log.debug('Exception during callback:', e)
        throw e  // caller can ultimately handle this.
      })
  }
}

Anvil.promise.callback = callback

/**
 * Authorize
 */

function authorize () {
  // handle the auth response
  if (Anvil.locAccess.hash()) {
    console.log('authorize() with hash:', Anvil.locAccess.hash())
    return Anvil.promise.callback(parseFormUrlEncoded(Anvil.locAccess.hash()))

  // initiate the auth flow
  } else {
    Anvil.destination(Anvil.locAccess.path())

    var window = Anvil.domAccess.getWindow()
    if (Anvil.display === 'popup') {
      // open the signin page in a popup window
      // In a typical case the popup window will be redirected
      // to the configured callback page.

      // If this callback page is rendered in the popup it
      // should send the message:
      // `opener.postMessage(location.href, opener.location.origin)`.
      // This will then cause a login in this window (not the popup) as
      // implemented in the 'message' listener below.

      var popup

      let authMessageReceived = new Promise(function (resolve, reject) {
        let listener = function listener (event) {
          if (event.data !== '__ready__') {
            var fragment = getUrlFragment(event.data)
            Anvil.promise.callback(parseFormUrlEncoded(fragment))
              .then(
              function (result) {
                resolve(result)
              },
              function (fault) {
                reject(fault)
              }
            )
            window.removeEventListener('message', listener, false)
            if (popup) {
              popup.close()
            }
          }
        }

        window.addEventListener('message', listener, false)
      })
      // Some authentication methods will NOT cause a redirect ever!
      //
      // The passwordless login method sends the user a link in an email.
      // When the user presses this link then a new window openes with the
      // configured callback.
      // In Anvil case the callback page has no opener and is expected to
      // call Anvil.callback itself.
      // The listener below will react to the case where there is a
      // successful login and then close the popup.
      let authenticated = new Promise(function (resolve, reject) {
        Anvil.once('authenticated', function () {
          resolve()
          if (popup) {
            popup.close()
          }
        })
      })
      return Anvil.promise.uri().then(uri => {
        popup = window.open(uri, 'anvil', Anvil.popup(700, 500))
        return Promise.race([authMessageReceived, authenticated])
      })
    } else {
      // navigate the current window to the provider
      return Anvil.promise.uri().then(uri => {
        window.location = uri
      })
    }
  }
}

Anvil.promise.authorize = authorize

/**
 * Signout
 */

function signout (path) {
  var win = Anvil.domAccess.getWindow()
  // parse the window location
  var url = Anvil.domAccess.getDocument().createElement('a')
  url.href = win.location.href
  url.pathname = path || '/'

  // set the destination
  Anvil.destination(path || false)

  // url to sign out of the auth server
  var signoutLocation = Anvil.issuer + '/signout?post_logout_redirect_uri=' +
    url.href + '&id_token_hint=' + Anvil.session.id_token

  // reset the session
  Anvil.reset()

  // "redirect"
  win.location = signoutLocation
}

Anvil.signout = signout

/**
 * Destination
 *
 * Getter/setter location.pathname
 *
 *    // Set the destination
 *    Anvil.destination(location.pathname)
 *
 *    // Get the destination
 *    Anvil.destination()
 *
 *    // Clear the destination
 *    Anvil.destination(false)
 */

function destination (path) {
  if (path === false) {
    path = localStorage['anvil.connect.destination']
    log.debug('destination(): deleting and returning:', path)
    delete localStorage['anvil.connect.destination']
    return path
  } else if (path) {
    log.debug('destination(): setting:', path)
    localStorage['anvil.connect.destination'] = path
  } else {
    var dest = localStorage['anvil.connect.destination']
    log.debug('destination(): retrieving:', dest)
    return dest
  }
}

Anvil.destination = destination

/**
 * Check Session
 *
 * This is for use by the RP iframe, as specified by
 * OpenID Connect Session Management 1.0 - draft 23
 *
 * http://openid.net/specs/openid-connect-session-1_0.html
 */

function checkSession (id) {
  var targetOrigin = Anvil.issuer
  var message = Anvil.params.client_id + ' ' + Anvil.sessionState
  var w = window.parent.document.getElementById(id).contentWindow
  w.postMessage(message, targetOrigin)
}

Anvil.checkSession = checkSession

/**
 * Update Session
 */

function updateSession (event) {
  log.debug('updateSession()', event)
  if (event.key === 'anvil.connect') {
    log.debug('updateSession(): anvil.connect: calling deserialize')
    Anvil.promise.deserialize()
    // happens now in deserialize
    // Anvil.emit('authenticated', Anvil.session)
  }
}

Anvil.updateSession = updateSession  // todo: should this be a promise?

/**
 * Is Authenticated
 */

function isAuthenticated () {
  return (Anvil.session.id_token)
}

Anvil.isAuthenticated = isAuthenticated

export default Anvil
