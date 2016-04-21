/* eslint-env jasmine */
/* global localStorage, Date */
import 'webcrypto-shim'
import {module, inject} from 'angular-mocks'
import MockDate from 'mockdate'
import './anvil-connect-angular'
import * as testData from './test-data'

import * as jwsValidatorDecodeonly from '../src/jws-validator-decodeonly'

describe('Anvil Connect', function () {
  var {Anvil, AnvilProvider, uri, $httpBackend, promise} = {}

  var config = {
    issuer: testData.real_data.access_claims.iss,
    client_id: testData.real_data.access_claims.aud,
    redirect_uri: 'https://my.app.com',
    scope: ['other'],
    display: 'popup',
    jwk: testData.real_data.jwk
  }

  beforeEach(module('anvil'))

  beforeEach(module(function ($injector) {
    AnvilProvider = $injector.get('AnvilProvider')
    AnvilProvider.configure(config)
  }))
  // console.log('AFTER CONFIG', AnvilProvider)

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    Anvil = $injector.get('Anvil')
  }))
  describe('configure provider', function () {
    it('should set the issuer', function () {
      expect(AnvilProvider.issuer).toBe(config.issuer)
    })

    it('should set the default response type', function () {
      expect(AnvilProvider.params.response_type).toBe('id_token token')
    })

    it('should set the client id', function () {
      expect(AnvilProvider.params.client_id).toBe(config.client_id)
    })

    it('should set the redirect uri', function () {
      expect(AnvilProvider.params.redirect_uri).toBe(config.redirect_uri)
    })

    it('should set the default scope', function () {
      expect(AnvilProvider.params.scope).toContain('openid')
      expect(AnvilProvider.params.scope).toContain('profile')
    })

    it('should set additional scope', function () {
      expect(AnvilProvider.params.scope).toContain('other')
    })

    it('should set the display', function () {
      expect(AnvilProvider.display).toBe('popup')
    })

    it('should set the default display', function () {
      AnvilProvider.configure({})
      expect(AnvilProvider.display).toBe('page')
    })
  })

  describe('toFormUrlEncoded', function () {
    it('should encode a string from an object', function () {
      var encoded = Anvil.toFormUrlEncoded(AnvilProvider.params)
      expect(encoded).toContain('response_type=id_token%20token')
      expect(encoded).toContain('&redirect_uri=https%3A%2F%2Fmy.app.com')
      expect(encoded).toContain('&scope=openid%20profile%20other')
    })
  })

  describe('parseFormUrlEncoded', function () {
    it('should decode and parse an encoded object', function () {
      var decoded = Anvil.parseFormUrlEncoded('a=b%20c&d=e')
      expect(decoded.a).toBe('b c')
      expect(decoded.d).toBe('e')
    })
  })

  describe('parseUriFragment', function () {
    it('should return a fragment value from a Url', function () {
      var fragment = Anvil.getUrlFragment('https://host:port/path#a=b&c=d')
      expect(fragment).toBe('a=b&c=d')
    })
  })

  describe('popup', function () {
    it('should return parameters for a popup window', function () {
      var popup = Anvil.popup(700, 500)
      expect(popup).toContain('width=700,')
      expect(popup).toContain('height=500,')

      expect(popup).toContain('dialog=yes,')
      expect(popup).toContain('dependent=yes,')
      expect(popup).toContain('scrollbars=yes,')
      expect(popup).toContain('location=yes')
    })
  })

  describe('promise.serialize', function () {
    beforeEach(function (done) {
      delete localStorage['anvil.connect']
      Anvil.session.access_token = 'random'
      Anvil.promise.serialize().then(r => {
        this.result = r
        done()
      }).catch(e => {
        this.exception = e
        done.fail(e)
      })
    })

    it('should store the current session in localStorage', function () {
      expect(localStorage['anvil.connect']).toBeDefined()
    })
  })

  describe('promise.deserialize', function () {
    it('should retrieve and parse the current session from localStorage')
  })

  describe('reset', function () {
    it('should delete the current session from localStorage')
    it('should reset the session object')
    it('should remove the cookie value')
  })

  describe('uri with "authorize" endpoint', function () {
    beforeEach(function (done) {
      Anvil.promise.uri().then(v => {
        uri = v
        done()
      })
    })

    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/authorize?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "signin" endpoint', function () {
    beforeEach(function (done) {
      Anvil.promise.uri('signin').then(v => {
        uri = v
        done()
      })
    })

    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/signin?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "signup" endpoint', function () {
    beforeEach(function (done) {
      Anvil.promise.uri('signup').then(v => {
        uri = v
        done()
      })
    })
    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/signup?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "connect" endpoint', function () {
    it('should contain issuer')
    it('should contain endpoint')
    it('should contain response type')
    it('should contain client id')
    it('should contain redirect uri')
    it('should contain scope')
    it('should contain nonce')
  })

  describe('nonce without argument', function () {
    let result = {}
    beforeEach(function (done) {
      Anvil.promise.nonce().then(nonce => {
        result.nonce = nonce
        done()
      }).catch(e => {
        result.err = e
        done.fail(e)
      })
    })
    it('should return a base64url encoded sha256 hash of a random value', function () {
      expect(result.nonce.length).toBe(43)
    })

    it('should store the nonce in localStorage', function () {
      expect(localStorage['nonce'].length).toBe(10)
    })
  })

  describe('nonce with argument', function () {
    let result = {}
    beforeEach(function (done) {
      Anvil.promise.nonce().then(nonce => {
        result.nonce = nonce
        done()
      }).catch(e => {
        result.err = e
        done.fail(e)
      })
    })

    it('should verify an argument matching a hash of the value in localStorage', function (done) {
      Anvil.promise.nonce(result.nonce).then(val => {
        expect(val).toBe(true)
        done()
      })
    })

    it('should not verify a mismatching argument', function (done) {
      Anvil.promise.nonce('WRONG').then(val => {
        expect(val).toBe(false)
        done()
      })
    })
  })

  describe('sha256url', function () {
    let result = {}
    const input = 'test'

    beforeEach(function (done) {
      Anvil.promise.sha256url(input).then(r => {
        result.sha256url = r
        done()
      }).catch(e => {
        result.err = e
        done.fail(e)
      })
    })
    it('should base64url encode the SHA 256 hash of a provided string', () => {
      // the lines below worked when sjcl was included, however this dragged in
      // a bunch of crypto dependencies from browserify.
      // config.js had this:     "sjcl": "npm:sjcl@1.0.3",

      // let oldresult = sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(input))
      // expect(oldresult).toEqual('n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg')
      // expect(result.sha256url).toEqual(oldresult)
      expect(result.sha256url).toEqual('n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg')
    })
  })

  describe('headers', function () {
    it('should add a bearer token Authorization header to an object', function () {
      Anvil.session = { access_token: 'random' }
      expect(Anvil.headers()['Authorization']).toContain('Bearer random')
    })
  })

  describe('request', function () {
    uri = config.issuer + '/userinfo'

    beforeEach(function () {
      Anvil.session.access_token = 'random'
      var headers =
      {'Authorization': `Bearer ${Anvil.session.access_token}`,
        'Accept': 'application/json, text/plain, */*'}
      $httpBackend.expectGET(uri, headers).respond(200, {})
    })

    it('should add a bearer token to an HTTP request', function (done) {
      promise = Anvil.promise.request({ method: 'GET', url: uri })
      setTimeout(() => {
        $httpBackend.flush()
        promise.then(() => {
          done()
        })
      }, 0)
    })
  })

  describe('userInfo', function () {
    it('should request user info from the provider', function (done) {
      uri = config.issuer + '/userinfo'
      Anvil.session.access_token = 'random'
      var headers =
        {'Authorization': `Bearer ${Anvil.session.access_token}`,
        'Accept': 'application/json, text/plain, */*'}
      $httpBackend.expectGET(uri, headers).respond(200, {})
      promise = Anvil.promise.userInfo()
      setTimeout(() => {
        $httpBackend.flush()
        promise.then(() => {
          done()
        })
      }, 0)
    })
  })

  describe('callback with error response', function () {
    beforeEach(function () {
      localStorage['anvil.connect'] = '{}'
      promise = Anvil.promise.callback({ error: 'invalid' })
    })
    afterEach(function (done) {
      promise.catch(() => {
        // expect errors
        done()
      })
    })

    it('should return a promise', function () {
      expect(promise.then).toBeDefined()
    })

    it('should clear the session', function () {
      expect(localStorage['anvil.connect']).toBeUndefined()
    })

    it('should reject the promise', function () {
      promise.catch(err => {
        expect(err).toBeDefined()
      })
    })
  })

  describe('callback with authorization response', function () {
    let result = {}

    // pretty bad hack but it works.
    // the flush must happen after the request

    function flushHttpBackend () {
      try {
        $httpBackend.flush()
      } catch (e) {
        setTimeout(flushHttpBackend, 0) // try again
      }
    }

    beforeEach(function (done) {
      uri = config.issuer + '/userinfo'
      $httpBackend.when('GET', uri).respond(testData.real_data.userInfo)

      MockDate.set((testData.real_data.access_claims.iat + 1000) * 1000)
      // exp = iat + 3600
      // jasmine.clock().mockDate(baseTime) from jasmine 2.2

      // todo: should there be a test to have no id-token when response_type is 'token'
      // Anvil.configure(Object.assign({}, config, {response_type: 'token'}))
      // tlocalStorage['nonce'] = testData.real_data.id_claims.nonce
      spyOn(Anvil.promise, 'nonce').and.returnValue(Promise.resolve(true))
      promise = Anvil.promise.callback({
        access_token: testData.real_data.access_token,
        id_token: testData.real_data.id_token
      })
      setTimeout(flushHttpBackend, 0)
      promise.then(s => {
        result.session = s
        done()
      }).catch(e => {
        result.err = e
        done.fail(e)
      })
    })

    afterEach(() => {
      delete localStorage['nonce']
      MockDate.reset()
    })

    it('should return a promise', function () {
      expect(promise.then).toBeDefined()
    })

    it('should set session access_token property', function () {
      expect(Anvil.session.access_token).toBe(testData.real_data.access_token)
    })
    it('should set session id_token property', function () {
      expect(Anvil.session.id_token).toBe(testData.real_data.id_token)
    })
  })

  describe('callback with bad signature for authorization response and jws-validator-decodeonly', function () {
    let result = {}
    // pretty bad hack but it works.
    // the flush must happen after the request
    function flushHttpBackend () {
      try {
        $httpBackend.flush()
      } catch (e) {
        setTimeout(flushHttpBackend, 0) // try again
      }
    }

    beforeEach(function (done) {
      MockDate.set((testData.access_token.payload.iat + 1000) * 1000)
      uri = config.issuer + '/userinfo'
      $httpBackend.when('GET', uri).respond(testData.real_data.userInfo)
      Anvil.setNoWebCryptoFallbacks({
        jwtvalidatorOptions: {fallback: jwsValidatorDecodeonly, forceFallback: true}})

      Anvil.configure(Object.assign({}, config, {response_type: 'token'}))
      promise = Anvil.promise.callback({ access_token: testData.access_token_encoded_bad_signature })
      setTimeout(flushHttpBackend, 0)
      promise.then(s => {
        result.session = s
        done()
      }, e => {
        result.err = e
        done.fail(e)
      })
    })

    afterEach(function () {
      MockDate.reset()
      Anvil.setNoWebCryptoFallbacks({
        jwtvalidatorOptions: {}})
    })

    it('should return a promise', function () {
      expect(promise.then).toBeDefined()
    })

    it('should set session property on the service', function () {
      expect(Anvil.session.access_token).toBe(testData.access_token_encoded_bad_signature)
    })
  })

  // it 'should serialize the session'

    // it 'should resolve the promise'

  describe('authorize with location fragment', function () {
    it('should invoke the callback with the parsed authorization response')
  })

  describe('authorize with page display', function () {
    it('should navigate to the authorize endpoint')
  })

  describe('authorize with popup display', function () {
    it('should open a new window')
    it('should attach a listener')
    it('should return a promise')
  })

  describe('listener', function () {
    it('should invoke the callback with parsed event data')
    it('should remove the listener')
  })

  describe('connect', function () {})

  describe('signout', function () {})
})
