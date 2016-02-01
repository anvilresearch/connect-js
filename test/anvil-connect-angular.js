/* eslint-env es6 */

import 'webcrypto-shim'

'use strict'  // ES6 modules are strict but may be safer for transpiling perhaps
import Anvil from '../src/anvil-connect'
import angular from 'angular'

function init (providerOptions, $http, $q, $location, $window, $document) {
  Anvil.init(providerOptions, {
    http: {
      request: function (config) {
        return $http(config)
      },
      getData: function (response) {
        return response.data
      }
    },
    location: {
      hash: function () {
        return $location.hash()
      },
      path: function () {
        return $location.path()
      }
    },
    dom: {
      getWindow: function () {
        return $window
      },
      getDocument: function () {
        return $document[0]
      }
    }
  })
  return Anvil
}

angular.module('anvil', [])

  .provider('Anvil', function AnvilProvider () {
    /**
     * Require Authentication
     */

    function requireAuthentication ($location, Anvil) {
      if (!Anvil.isAuthenticated()) {
        Anvil.promise.authorize()
      }

      return Anvil.session
    }

    Anvil.requireAuthentication = ['$location', 'Anvil', requireAuthentication]

    /**
     * Require Scope
     */

    Anvil.requireScope = function (scope, fail) {
      return ['$location', 'Anvil', function requireScope ($location, Anvil) {
        if (!Anvil.isAuthenticated()) {
          return Anvil.promise.authorize()
        } else if (Anvil.session.access_claims.scope.indexOf(scope) === -1) {
          $location.path(fail)
          return false
        } else {
          return Anvil.session
        }
      }]
    }

    /**
     * Provider configuration
     */

    this.configure = function (options) {
      Anvil.configure(options)
    }

    /**
     * Factory
     */

    Anvil.$get = [
      '$q',
      '$http',
      '$rootScope',
      '$location',
      '$document',
      '$window', function ($q, $http, $rootScope, $location, $document, $window) {
        init(null, $http, $q, $location, $window, $document)
        return Anvil
      }]

    return Anvil
  })
