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

  });


});
