'use strict';

describe('Anvil', function () {

  var Anvil, AnvilProvider, $location, issuer, options;

  issuer = 'https://accounts.anvil.io'

  options = {
    client_id: 'uuid',
    redirect_uri: 'https://my.app.com',
    scope: ['research']
  };


  beforeEach(module('anvil'));

  beforeEach(module(function ($injector) {
    AnvilProvider = $injector.get('AnvilProvider');
    AnvilProvider.configure(issuer, options);
  }));

  beforeEach(inject(function ($injector) {
    Anvil = $injector.get('Anvil');
  }));


  describe('provider configuration', function () {

    it('should set the issuer', function () {
      expect(AnvilProvider.issuer).toBe(issuer);
    });

    it('should include the default scopes along with any specified scopes', function () {
      expect(AnvilProvider.params.scope).toEqual('openid profile research');
    });

    it('should set include the client_id', function () {
      expect(AnvilProvider.params.client_id).toEqual(options.client_id);
    });

    it('should set include the redirect_uri', function () {
      expect(AnvilProvider.params.redirect_uri).toEqual(options.redirect_uri);
    });

    it('should set a default response type of "id_token token"', function () {
      expect(AnvilProvider.params.response_type).toEqual('id_token token');
    });

    it('should define the correct "authorize" URL endpoint', function () {
      expect(AnvilProvider.urls.authorize).toContain(issuer);
      expect(AnvilProvider.urls.authorize).toContain('/authorize?');
      expect(AnvilProvider.urls.authorize).toContain('redirect_uri=' + options.redirect_uri);
      expect(AnvilProvider.urls.authorize).toContain('client_id=' + options.client_id);
      expect(AnvilProvider.urls.authorize).toContain('scope=openid profile research');
      expect(AnvilProvider.urls.authorize).toContain('response_type=id_token token');
    });

    it('should define the correct "signin" URL endpoint', function () {
      expect(AnvilProvider.urls.signin).toContain(issuer);
      expect(AnvilProvider.urls.signin).toContain('/signin?');
      expect(AnvilProvider.urls.signin).toContain('redirect_uri=' + options.redirect_uri);
      expect(AnvilProvider.urls.signin).toContain('client_id=' + options.client_id);
      expect(AnvilProvider.urls.signin).toContain('scope=openid profile research');
      expect(AnvilProvider.urls.signin).toContain('response_type=id_token token');
    });

    it('should define the correct "signup" URL endpoint', function () {
      expect(AnvilProvider.urls.signup).toContain(issuer);
      expect(AnvilProvider.urls.signup).toContain('/signup?');
      expect(AnvilProvider.urls.signup).toContain('redirect_uri=' + options.redirect_uri);
      expect(AnvilProvider.urls.signup).toContain('client_id=' + options.client_id);
      expect(AnvilProvider.urls.signup).toContain('scope=openid profile research');
      expect(AnvilProvider.urls.signup).toContain('response_type=id_token token');
    });

    it('should define the correct "userinfo" URL endpoint', function () {
      expect(AnvilProvider.urls.userinfo).toContain(issuer);
      expect(AnvilProvider.urls.userinfo).toContain('/userinfo');
    });

    it('should support external providers URIs', function () {
      expect(AnvilProvider.urls.connect('google')).toContain(issuer);
      expect(AnvilProvider.urls.connect('google')).toContain('/connect/google?');
      expect(AnvilProvider.urls.connect('google')).toContain('redirect_uri=' + options.redirect_uri);
      expect(AnvilProvider.urls.connect('google')).toContain('client_id=' + options.client_id);
      expect(AnvilProvider.urls.connect('google')).toContain('scope=openid profile research');
      expect(AnvilProvider.urls.connect('google')).toContain('response_type=id_token token');
    });
  });



  describe('urls', function () {

    it('should be available on service', function () {
      expect(Anvil.urls.authorize).toBeDefined()
    });

  });


  describe('uri', function () {
    it('should return an authorize uri by default', function () {
      expect(Anvil.uri('signup')).toContain(issuer)
      expect(Anvil.uri()).toContain('&nonce=')
    });
  });


  describe('nonce', function () {

    var nonce;

    beforeEach(function () {
      delete localStorage['nonce'];
      nonce = Anvil.nonce()
    });

    it('should save a random value in localStorage', function () {
      expect(localStorage['nonce'].length).toBe(10);
    });

    it('should compute a base64url encoded sha256 hash of the nonce', function () {
      expect(nonce.length).toEqual(43);
    });

    it('should verify the most recent nonce', function () {
      expect(Anvil.nonce(nonce)).toBe(true);
    });

  });


  describe('response', function () {

    beforeEach(inject(function ($location) {
      $location.hash('error=access_denied&error_description=test')
    }));

    it('should parse the uri fragment', function () {
      expect(Anvil.response().error).toEqual('access_denied')
      expect(Anvil.response().error_description).toEqual('test')
    });

  });


  describe('signin with page display', function () {

    it('should navigate to the authorization server');

  });

  describe('signin with popup display', function () {

    it('should open a new window');

  });

});
