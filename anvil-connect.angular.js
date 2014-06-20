'use strict';

angular.module('anvil', [])


  .provider('Anvil', function AnvilProvider () {

    /**
     * Private state
     */

    var issuer, params, encodedParams, display, urls = {}, session = {};


    /**
     * Provider configuration
     */

    this.configure = function (iss, options) {

      issuer = iss;

      params = {
        response_type:  options.response_type || 'id_token token',
        client_id:      options.client_id,
        redirect_uri:   options.redirect_uri,
        scope:          ['openid', 'profile'].concat(options.scope || []).join(' '),
        // other
      };

      encodedParams = toFormUrlEncoded(params),

      urls = {
        authorize:  issuer + '/authorize?' + encodedParams,
        signin:     issuer + '/signin?'    + encodedParams,
        signup:     issuer + '/signup?'    + encodedParams,
        userinfo:   issuer + '/userinfo',
        connect: function (provider) {
          return issuer + '/connect/' + provider + '?' + encodedParams;
        }
      };

      display        = options.display || 'page';

      this.issuer    = issuer;
      this.params    = params;
      this.urls      = urls;
      this.display   = display;

    };


    /**
     * Form Urlencode an object
     */

    function toFormUrlEncoded (obj) {
      var pairs = [];

      Object.keys(obj).forEach(function (key) {
        pairs.push(key + '=' + obj[key]);
      });

      return pairs.join('&');
    }


    /**
     * Parse Form Urlencoded data
     */

    function parseFormUrlEncoded (str) {
      var obj = {};

      str.split('&').forEach(function (property) {
        var pair = property.split('=')
          , key  = pair[0]
          , val  = pair[1]
          ;

        obj[key] = val;
      });

      return obj;
    }


    /**
     * Factory
     */

    this.$get = [
      '$q',
      '$http',
      '$location',
      '$document',
      '$window', function ($q, $http, $location, $document, $window) {


      var Anvil = {};

      /**
       * Session object
       */

      Anvil.session = session;


      /**
       * Serialize session
       */

      Anvil.serialize = function () {
        var now = new Date()
          , time = now.getTime()
          , exp = time + (Anvil.session.expires_in || 3600) * 1000
          , secret = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(Math.random().toString(36).substr(2, 10)))
          ;

        now.setTime(exp);
        document.cookie = 'anvil.connect=' + secret + '; expires=' + now.toUTCString();
        var encrypted = sjcl.encrypt(secret, JSON.stringify(Anvil.session));
        localStorage['anvil.connect'] = encrypted;
        console.log('SERIALIZED', encrypted);
      };


      /**
       * Deserialize session
       */

      Anvil.deserialize = function () {
        var re, secret, json, parsed;

        try {
          // Use the cookie value to decrypt the session in localStorage
          re      = new RegExp('[; ]anvil.connect=([^\\s;]*)');
          secret  = document.cookie.match(re).pop();
          json    = sjcl.decrypt(secret, localStorage['anvil.connect']);
          parsed  = JSON.parse(json);

        } catch (e) {
          console.log('Cannot deserialize session data');
        }

        Anvil.session = session = parsed;
        console.log('DESERIALIZED', session);
      };


      /**
       * Urls
       */

      Anvil.urls = urls;


      /**
       * Quick and dirty uri method with nonce
       */

      Anvil.uri = function (endpoint) {
        return issuer + '/'
             + (endpoint || 'authorize') + '?'
             + encodedParams
             + '&nonce=' + this.nonce()
             ;
      };


      /**
       * Create or verify a nonce
       */

      Anvil.nonce = function (nonce) {
        if (nonce) {
          return (this.sha256url(localStorage['nonce']) === nonce);
        } else {
          localStorage['nonce'] = Math.random().toString(36).substr(2, 10);
          return this.sha256url(localStorage['nonce']);
        }
      };


      /**
       * Base64url encode a SHA256 hash of the input string
       */

      Anvil.sha256url = function (str) {
        return sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(str));
      };


      /**
       * Parse uri fragment response from Anvil Connect
       */

      Anvil.response = function () {
        return parseFormUrlEncoded($location.hash());
      };


      /**
       * Headers
       */

      Anvil.headers = function (headers) {
        if (this.session.access_token) {
          return angular.extend(headers || {}, {
            'Authorization': 'Bearer ' + this.session.access_token
          });
        } else {
          return headers;
        }
      };


      /**
       * Request
       */

      Anvil.request = function (config) {
        var deferred = $q.defer();

        config.headers = this.headers(config.headers);

        function success (response) {
          deferred.resolve(response.data);
        }

        function failure (fault) {
          deferred.reject(fault);
        }

        $http(config).then(success, failure);

        return deferred.promise;
      };


      /**
       * UserInfo
       */

      Anvil.userInfo = function () {
        return this.request({
          method: 'GET',
          url: this.urls.userinfo
        });
      };


      /**
       * Authorize
       */

      Anvil.authorize = function (authorization) {
        // handle the auth response
        if (authorization) {
          var deferred = $q.defer()
            , response = parseFormUrlEncoded($location.hash())
            ;

          // handle authorization error
          if (response.error) {
            deferred.reject(response);
            console.log('ERROR', response)
            // clear localStorage/cookie?
          }

          // handle successful authorization
          else {
            // TODO:
            // - verify id token
            // - verify nonce
            // - verify access token (athash claim)
            // - expose userinfo as a property of the service


            Anvil.session = session = response;

            Anvil.userInfo().then(

              function userInfoSuccess (userInfo) {
                Anvil.session.userInfo = userInfo;
                Anvil.serialize();
                deferred.resolve(session);
              },

              function userInfoFailure () {

              }

            );
          }

          return deferred.promise;
        }

        // initiate the auth flow
        else {
          // open the signin page in a popup window
          if (display === 'popup') {
            $window.open(this.uri(), 'authorize', 'width=500, height=600');
          }

          // navigate the current window to the provider
          else {
            $window.location = this.uri();
          }
        }
      };


      /**
       * Signout
       */

      Anvil.signout = function () {
        Anvil.session = session = {};
        document.cookie = 'anvil.connect=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        delete localStorage['anvil.connect'];
        // what about signing out of the auth server?
      };


      /**
       * Reinstate an existing session
       */

      Anvil.deserialize();


      /**
       * Service
       */

      return Anvil;

    }];
  })

