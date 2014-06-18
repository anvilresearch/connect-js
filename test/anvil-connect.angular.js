'use strict';

describe('Anvil', function () {

  var Anvil, AnvilProvider, issuer, options;

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


});
