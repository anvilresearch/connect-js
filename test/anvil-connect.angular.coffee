'use strict'

describe 'Anvil Connect', ->




  {Anvil,AnvilProvider,uri,nonce,$httpBackend,promise,jwk} = {}




  config =
    issuer:       'https://accounts.anvil.io'
    client_id:    'uuid'
    redirect_uri: 'https://my.app.com'
    scope:        ['other']
    display:      'popup'
    jwk:
      "kty":"RSA",
      "use":"sig",
      "alg":"RS256",
      "n":"AJ4bmyK/fLoEMPuiR6uHOWlhjJRQFPunVxWHsG8uwPneJmPxCGPbboyVlCGtD1xsfHtygIu7zhfNbb1AiHW5pc3bi1k8udM3CHQUTuneudNtMkIODGm/pTV3nQ1TH1tr9ebquT360DTEhkmjv/5LZwsnOA0HAf/3GG9fu8gl55mhpKnyhWpkbrHryuh8cx8hUzLwi5Rr5gA1IrhQP9SFX2y68suSS0wp7HoQTIie6EXy/G2OJi7kqJS0UjkXK7ZPqf56OGBm+TlYBmwyXdWZ3bBglnlPjBb67exSMiXmi+yeeFa52tWLZlOqNf6CWb2XrNf6PWCxt0NZ7V3HPOrjOmM=",
      "e":"AQAB"


  beforeEach module 'anvil'

  beforeEach module ($injector) ->
    AnvilProvider = $injector.get 'AnvilProvider'
    AnvilProvider.configure config
    #console.log('AFTER CONFIG', AnvilProvider)

  beforeEach inject ($injector) ->
    $httpBackend = $injector.get '$httpBackend'
    Anvil = $injector.get 'Anvil'




  describe 'setJWK', ->

    describe 'with empty argument', ->

      beforeEach ->
        jwk =
          kid: 'empty'
          kty: 'TEST'
          use: 'sig'
          alg: 'WTF'
          n: 'h3xh3xh3x'
          e: 'h3x'
        localStorage['anvil.connect.jwk'] = JSON.stringify jwk
        AnvilProvider.setJWK()

      it 'should serialize the JWK in localStorage', ->
        expect(localStorage['anvil.connect.jwk']).toEqual JSON.stringify(jwk)

      it 'should set the jwk on the provider', ->
        expect(AnvilProvider.jwk).toEqual jwk

      it 'should set the modulus on the provider', ->
        expect(AnvilProvider.hN).toBe b64tohex(jwk.n)

      it 'should set the exponent on the provider', ->
        expect(AnvilProvider.hE).toBe b64tohex(jwk.e)


    describe 'with object argument', ->

      beforeEach ->
        jwk =
          kid: 'object'
          kty: 'TEST'
          use: 'sig'
          alg: 'WTF'
          n: 'h3xh3xh3x'
          e: 'h3x'
        AnvilProvider.setJWK(jwk)

      it 'should serialize the JWK in localStorage', ->
        expect(localStorage['anvil.connect.jwk']).toBe JSON.stringify(jwk)

      it 'should set the jwk on the provider', ->
        expect(AnvilProvider.jwk).toBe jwk

      it 'should set the modulus on the provider', ->
        expect(AnvilProvider.hN).toBe b64tohex(jwk.n)

      it 'should set the exponent on the provider', ->
        expect(AnvilProvider.hE).toBe b64tohex(jwk.e)


    describe 'with array argument', ->

      beforeEach ->
        jwk =
          kid: 'object'
          kty: 'TEST'
          use: 'sig'
          alg: 'WTF'
          n: 'h3xh3xh3x'
          e: 'h3x'
        AnvilProvider.setJWK([jwk])

      it 'should serialize the JWK in localStorage', ->
        expect(localStorage['anvil.connect.jwk']).toBe JSON.stringify(jwk)

      it 'should set the jwk on the provider', ->
        expect(AnvilProvider.jwk).toBe jwk

      it 'should set the modulus on the provider', ->
        expect(AnvilProvider.hN).toBe b64tohex(jwk.n)

      it 'should set the exponent on the provider', ->
        expect(AnvilProvider.hE).toBe b64tohex(jwk.e)




  describe 'configure provider', ->

    it 'should set the issuer', ->
      expect(AnvilProvider.issuer).toBe config.issuer

    it 'should set the default response type', ->
      expect(AnvilProvider.params.response_type).toBe 'id_token token'

    it 'should set the client id', ->
      expect(AnvilProvider.params.client_id).toBe config.client_id

    it 'should set the redirect uri', ->
      expect(AnvilProvider.params.redirect_uri).toBe config.redirect_uri

    it 'should set the default scope', ->
      expect(AnvilProvider.params.scope).toContain 'openid'
      expect(AnvilProvider.params.scope).toContain 'profile'

    it 'should set additional scope', ->
      expect(AnvilProvider.params.scope).toContain 'other'

    it 'should set the display', ->
      expect(AnvilProvider.display).toBe 'popup'

    it 'should set the default display', ->
      AnvilProvider.configure {}
      expect(AnvilProvider.display).toBe 'page'


  describe 'toFormUrlEncoded', ->

    it 'should encode a string from an object', ->
      encoded = Anvil.toFormUrlEncoded(AnvilProvider.params)
      expect(encoded).toContain 'response_type=id_token%20token'
      expect(encoded).toContain '&redirect_uri=https%3A%2F%2Fmy.app.com'
      expect(encoded).toContain '&scope=openid%20profile%20other'


  describe 'parseFormUrlEncoded', ->

    it 'should decode and parse an encoded object', ->
      decoded = Anvil.parseFormUrlEncoded('a=b%20c&d=e')
      expect(decoded.a).toBe 'b c'
      expect(decoded.d).toBe 'e'


  describe 'parseUriFragment', ->

    it 'should return a fragment value from a Url', ->
      fragment = Anvil.getUrlFragment('https://host:port/path#a=b&c=d')
      expect(fragment).toBe 'a=b&c=d'


  describe 'popup', ->

    it 'should return parameters for a popup window', ->
      popup = Anvil.popup(700, 500)
      expect(popup).toContain 'width=700,'
      expect(popup).toContain 'height=500,'
      expect(popup).toContain 'dialog=yes,'
      expect(popup).toContain 'dependent=yes,'
      expect(popup).toContain 'scrollbars=yes,'
      expect(popup).toContain 'location=yes'


  describe 'serialize', ->

    beforeEach ->
      delete localStorage['anvil.connect']
      Anvil.session.access_token = 'random'
      Anvil.serialize()

    it 'should store the current session in localStorage', ->
      expect(localStorage['anvil.connect']).toBeDefined()


  describe 'deserialize', ->

    it 'should retrieve and parse the current session from localStorage'


  describe 'reset', ->

    it 'should delete the current session from localStorage'
    it 'should reset the session object'
    it 'should remove the cookie value'


  describe 'uri with "authorize" endpoint', ->

    beforeEach ->
      uri = Anvil.uri()

    it 'should contain issuer', ->
      expect(uri).toContain config.issuer

    it 'should contain endpoint', ->
      expect(uri).toContain '/authorize?'

    it 'should contain response type', ->
      expect(uri).toContain 'id_token%20token'

    it 'should contain client id', ->
      expect(uri).toContain config.client_id

    it 'should contain redirect uri', ->
      expect(uri).toContain encodeURIComponent(config.redirect_uri)

    it 'should contain scope', ->
      expect(uri).toContain encodeURIComponent('openid profile other')

    it 'should contain nonce', ->
      expect(uri).toContain '&nonce='


  describe 'uri with "signin" endpoint', ->

    beforeEach ->
      uri = Anvil.uri('signin')

    it 'should contain issuer', ->
      expect(uri).toContain config.issuer

    it 'should contain endpoint', ->
      expect(uri).toContain '/signin?'

    it 'should contain response type', ->
      expect(uri).toContain 'id_token%20token'

    it 'should contain client id', ->
      expect(uri).toContain config.client_id

    it 'should contain redirect uri', ->
      expect(uri).toContain encodeURIComponent(config.redirect_uri)

    it 'should contain scope', ->
      expect(uri).toContain encodeURIComponent('openid profile other')

    it 'should contain nonce', ->
      expect(uri).toContain '&nonce='


  describe 'uri with "signup" endpoint', ->

    beforeEach ->
      uri = Anvil.uri('signup')

    it 'should contain issuer', ->
      expect(uri).toContain config.issuer

    it 'should contain endpoint', ->
      expect(uri).toContain '/signup?'

    it 'should contain response type', ->
      expect(uri).toContain 'id_token%20token'

    it 'should contain client id', ->
      expect(uri).toContain config.client_id

    it 'should contain redirect uri', ->
      expect(uri).toContain encodeURIComponent(config.redirect_uri)

    it 'should contain scope', ->
      expect(uri).toContain encodeURIComponent('openid profile other')

    it 'should contain nonce', ->
      expect(uri).toContain '&nonce='


  describe 'uri with "connect" endpoint', ->

    it 'should contain issuer'
    it 'should contain endpoint'
    it 'should contain response type'
    it 'should contain client id'
    it 'should contain redirect uri'
    it 'should contain scope'
    it 'should contain nonce'


  describe 'nonce without argument', ->

    it 'should return a base64url encoded sha256 hash of a random value', ->
      expect(Anvil.nonce().length).toBe 43

    it 'should store the nonce in localStorage', ->
      nonce = Anvil.nonce()
      expect(localStorage['nonce'].length).toBe 10


  describe 'nonce with argument', ->

    beforeEach ->
      nonce = Anvil.nonce()

    it 'should verify an argument matching a hash of the value in localStorage', ->
      expect(Anvil.nonce(nonce)).toBe true

    it 'should not verify a mismatching argument', ->
      expect(Anvil.nonce('WRONG')).toBe false


  describe 'sha256url', ->

    it 'should base64url encode the SHA 256 hash of a provided string'


  describe 'headers', ->

    it 'should add a bearer token Authorization header to an object', ->
      Anvil.session = { access_token: 'random' }
      expect(Anvil.headers()['Authorization']).toContain 'Bearer random'


  describe 'request', ->

    it 'should add a bearer token to an HTTP request', ->
      uri = config.issuer + '/userinfo'
      Anvil.session.access_token = 'random'
      headers =
        'Authorization': "Bearer #{Anvil.session.access_token}",
        'Accept': 'application/json, text/plain, */*'
      $httpBackend.expectGET(uri, headers).respond(200, {})
      Anvil.request({ method: 'GET', url: uri })
      $httpBackend.flush()


  describe 'userInfo', ->

    it 'should request user info from the provider', ->
      uri = config.issuer + '/userinfo'
      Anvil.session.access_token = 'random'
      headers =
        'Authorization': "Bearer #{Anvil.session.access_token}",
        'Accept': 'application/json, text/plain, */*'
      $httpBackend.expectGET(uri, headers).respond(200, {})
      Anvil.userInfo()
      $httpBackend.flush()


  describe 'callback with error response', ->

    beforeEach ->
      localStorage['anvil.connect'] = '{}'
      promise = Anvil.callback({ error: 'invalid' })

    it 'should return a promise', ->
      expect(promise.then).toBeDefined()

    it 'should clear the session', ->
      Anvil.callback({ error: 'invalid' })
      expect(localStorage['anvil.connect']).toBeUndefined()

    it 'should reject the promise'


  describe 'callback with authorization response', ->

    beforeEach ->
      promise = Anvil.callback({ access_token: "eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ" })

    it 'should return a promise', ->
      expect(promise.then).toBeDefined()

    it 'should set session property on the service', ->
      expect(Anvil.session.access_token).toBe "eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ"

    #it 'should serialize the session'

    #it 'should resolve the promise'


  describe 'authorize with location fragment', ->

    it 'should invoke the callback with the parsed authorization response'


  describe 'authorize with page display', ->

    it 'should navigate to the authorize endpoint'


  describe 'authorize with popup display', ->

    it 'should open a new window'
    it 'should attach a listener'
    it 'should return a promise'


  describe 'listener', ->

    it 'should invoke the callback with parsed event data'
    it 'should remove the listener'


  describe 'connect', ->


  describe 'signout', ->


