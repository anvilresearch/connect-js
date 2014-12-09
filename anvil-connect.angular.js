'use strict';

angular.module('anvil', [])


  .provider('Anvil', function AnvilProvider () {

    /**
     * Reference to AnvilProvider
     */

    var provider = this;


    /**
     * Private state
     */

    var issuer, jwk, hN, hE, pubkey, params, display, session = {};


    /**
     * Set JWK
     */

    function setJWK (jwks) {
      var key = 'anvil.connect.jwk';

      // Recover from localStorage.
      if (!jwks) {
        try {
          jwk = JSON.parse(localStorage[key]);
        } catch (e) {
          console.log('Cannot deserialized JWK');
        }
      }

      // Argument is a naked object.
      if (!Array.isArray(jwks) && typeof jwks === 'object') {
        jwk = jwks;
      }

      // Argument is an array of JWK objects.
      // Find the key for verifying signatures.
      if (Array.isArray(jwks)) {
        jwks.forEach(function (obj) {
          if (obj && obj.use === 'sig') {
            jwk = obj;
          }
        });
      }

      if (jwk) {
        provider.jwk = jwk;
        provider.hN = hN = b64tohex(jwk.n);
        provider.hE = hE = b64tohex(jwk.e);
        localStorage[key] = JSON.stringify(jwk)
      }
    }

    this.setJWK = setJWK;


    /**
     * Require Authentication
     */

    function requireAuthentication ($location, Anvil) {
      if (!Anvil.isAuthenticated()) {
        Anvil.authorize();
      }

      return Anvil.session;
    }

    this.requireAuthentication = ['$location', 'Anvil', requireAuthentication];


    /**
     * Require Scope
     */

    this.requireScope = function (scope, fail) {
      return ['$location', 'Anvil', function requireScope ($location, Anvil) {
        if (!Anvil.isAuthenticated()) {
          Anvil.authorize();
        } else if (Anvil.session.access_claims.scope.indexOf(scope) === -1) {
          $location.path(fail);
          return false;
        } else {
          return Anvil.session
        }
      }];
    }


    /**
     * Provider configuration
     */

    this.configure = function (options) {
      this.issuer = issuer = options.issuer;

      setJWK(options.jwk)

      this.params = params = {};
      this.params.response_type = options.response_type || 'id_token token';
      this.params.client_id = options.client_id;
      this.params.redirect_uri = options.redirect_uri;
      this.params.scope = [
        'openid',
        'profile'
      ].concat(options.scope).join(' ');
      this.display = display = options.display || 'page';
    };


    /**
     * Factory
     */

    this.$get = [
      '$q',
      '$http',
      '$location',
      '$document',
      '$window', function ($q, $http, $location, $document, $window) {


      /**
       * Service
       */

      var Anvil = {};


      /**
       * Form Urlencode an object
       */

      function toFormUrlEncoded (obj) {
        var pairs = [];

        Object.keys(obj).forEach(function (key) {
          pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        });

        return pairs.join('&');
      }

      Anvil.toFormUrlEncoded = toFormUrlEncoded;


      /**
       * Parse Form Urlencoded data
       */

      function parseFormUrlEncoded (str) {
        var obj = {};

        str.split('&').forEach(function (property) {
          var pair = property.split('=')
            , key  = decodeURIComponent(pair[0])
            , val  = decodeURIComponent(pair[1])
            ;

          obj[key] = val;
        });

        return obj;
      }

      Anvil.parseFormUrlEncoded = parseFormUrlEncoded;


      /**
       * Get URI Fragment
       */

      function getUrlFragment (url) {
        return url.split('#').pop();
      }

      Anvil.getUrlFragment = getUrlFragment;


      /**
       * Configure the authorize popup window
       * Adapted from dropbox-js for ngDropbox
       */

      function popup (popupWidth, popupHeight) {
        var x0, y0, width, height, popupLeft, popupTop;

        // Metrics for the current browser window.
        x0 = $window.screenX || $window.screenLeft
        y0 = $window.screenY || $window.screenTop
        width = $window.outerWidth || $document.documentElement.clientWidth
        height = $window.outerHeight || $document.documentElement.clientHeight

        // Computed popup window metrics.
        popupLeft = Math.round(x0) + (width - popupWidth) / 2
        popupTop = Math.round(y0) + (height - popupHeight) / 2.5
        if (popupLeft < x0) { popupLeft = x0 }
        if (popupTop < y0) { popupTop = y0 }

        return 'width=' + popupWidth + ',height=' + popupHeight + ',' +
               'left=' + popupLeft + ',top=' + popupTop + ',' +
               'dialog=yes,dependent=yes,scrollbars=yes,location=yes';
      }

      Anvil.popup = popup;


      /**
       * Session object
       */

      Anvil.session = session;


      /**
       * Serialize session
       */

      function serialize () {
        var now = new Date()
          , time = now.getTime()
          , exp = time + (Anvil.session.expires_in || 3600) * 1000
          , random = Math.random().toString(36).substr(2, 10)
          , secret = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(random))
          ;

        now.setTime(exp);
        document.cookie = 'anvil.connect=' + secret
                        + '; expires=' + now.toUTCString();

        var encrypted = sjcl.encrypt(secret, JSON.stringify(Anvil.session));
        localStorage['anvil.connect'] = encrypted;
        console.log('SERIALIZED', encrypted);
      };

      Anvil.serialize = serialize;


      /**
       * Deserialize session
       */

      function deserialize () {
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

        Anvil.session = session = parsed || {};
        console.log('DESERIALIZED', session);
      };

      Anvil.deserialize = deserialize;


      /**
       * Reset
       */

      function reset () {
        Anvil.session = session = {};
        document.cookie = 'anvil.connect=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        delete localStorage['anvil.connect'];
      };

      Anvil.reset = reset;


      /**
       * Quick and dirty uri method with nonce
       */

      function uri (endpoint) {
        return issuer + '/'
             + (endpoint || 'authorize') + '?'
             + toFormUrlEncoded(angular.extend({}, params, {
                nonce: this.nonce()
               }));
      };

      Anvil.uri = uri;


      /**
       * Create or verify a nonce
       */

      function nonce (nonce) {
        if (nonce) {
          return (Anvil.sha256url(localStorage['nonce']) === nonce);
        } else {
          localStorage['nonce'] = Math.random().toString(36).substr(2, 10);
          return this.sha256url(localStorage['nonce']);
        }
      };

      Anvil.nonce = nonce;


      /**
       * Base64url encode a SHA256 hash of the input string
       */

      function sha256url (str) {
        return sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(str));
      };

      Anvil.sha256url = sha256url;


      /**
       * Headers
       */

      function headers (headers) {
        if (this.session.access_token) {
          return angular.extend(headers || {}, {
            'Authorization': 'Bearer ' + this.session.access_token
          });
        } else {
          return headers;
        }
      };

      Anvil.headers = headers;


      /**
       * Request
       */

      function request (config) {
        var deferred = $q.defer();

        config.headers = this.headers(config.headers);

        function success (response) {
          deferred.resolve(response.data);
        }

        function failure (fault) {
          deferred.reject(fault);
          console.log(fault)
        }

        $http(config).then(success, failure);

        return deferred.promise;
      };

      Anvil.request = request;


      /**
       * UserInfo
       */

      function userInfo () {
        return this.request({
          method: 'GET',
          url: issuer + '/userinfo'
        });
      };

      Anvil.userInfo = userInfo;


      /**
       * Callback
       */

      function callback (response) {
        var deferred = $q.defer();

        if (response.error) {
          // clear localStorage/cookie/etc
          Anvil.reset()
          deferred.reject(response);
        }

        else {

          var accessJWS = new KJUR.jws.JWS();
          var idJWS = new KJUR.jws.JWS();

          // NEED TO REVIEW THIS CODE FOR SANITY
          // Check the conditions in which some of these verifications
          // are skipped.

          // Decode the access token and verify signature
          if (response.access_token
           && !accessJWS.verifyJWSByNE(response.access_token, hN, hE)) {
            deferred.reject('Failed to verify access token signature.')
          }

          // Decode the id token and verify signature
          if (response.id_token
           && !idJWS.verifyJWSByNE(response.id_token, hN, hE)) {
            deferred.reject('Failed to verify id token signature.')
          }

          // Parse the access token payload
          try {
            response.access_claims = JSON.parse(accessJWS.parsedJWS.payloadS)
          } catch (e) {
            deferred.reject("Can't parse access token payload.");
          }

          // Parse the id token payload
          try {
            response.id_claims = JSON.parse(idJWS.parsedJWS.payloadS)
          } catch (e) {
            deferred.reject("Can't parse id token payload.");
          }

          // Validate the nonce
          if (response.id_claims && !nonce(response.id_claims.nonce)) {
            deferred.reject('Invalid nonce.');
          }

          // Verify at_hash
          if (['id_token token'].indexOf(params.response_type) !== -1) {
            var atHash = CryptoJS
              .SHA256(response.access_token)
              .toString(CryptoJS.enc.Hex)
            atHash = atHash.slice(0, atHash.length / 2);
            if (response.id_claims && atHash !== response.id_claims.at_hash) {
              deferred.reject('Invalid access token hash in id token payload');
            }
          }

          Anvil.session = session = response;

          Anvil.userInfo().then(
            function userInfoSuccess (userInfo) {
              Anvil.session.userInfo = userInfo;
              Anvil.serialize();
              deferred.resolve(session);
            },

            function userInfoFailure () {
              deferred.reject('Retrieving user info from server failed.');
            }
          );
        }

        return deferred.promise;
      };

      Anvil.callback = callback;


      /**
       * Authorize
       */

      function authorize () {
        // handle the auth response
        if ($location.hash()) {
          return Anvil.callback(parseFormUrlEncoded($location.hash()));
        }

        // initiate the auth flow
        else {
          Anvil.destination($location.path());

          // open the signin page in a popup window
          if (display === 'popup') {
            var deferred = $q.defer();


            var listener = function listener (event) {
              if (event.data !== '__ready__') {
                var fragment = getUrlFragment(event.data);
                Anvil.callback(parseFormUrlEncoded(fragment)).then(
                    function (result) { deferred.resolve(result); },
                    function (fault) { deferred.reject(fault); }
                );
                $window.removeEventListener('message', listener, false);
              }
            }


            $window.addEventListener('message', listener, false);
            $window.open(this.uri(), 'anvil', popup(700, 500));

            return deferred.promise;
          }

          // navigate the current window to the provider
          else {
            $window.location = this.uri();
          }
        }
      };

      Anvil.authorize = authorize;


      /**
       * Signout
       */

      function signout (path) {
        // parse the window location
        var url = document.createElement('a');
        url.href = $window.location.href;
        url.pathname = path || '/';

        // set the destination
        Anvil.destination(path || false);
        Anvil.reset();

        // "redirect" to sign out of the auth server
        $window.location = issuer + '/signout?redirect_uri=' + url.href;
      }

      Anvil.signout = signout;


      /**
       * Destination
       *
       * Getter/setter $location.path()
       *
       *    // Set the destination
       *    Anvil.destination($location.path());
       *
       *    // Get the destination
       *    Anvil.destination();
       *
       *    // Clear the destination
       *    Anvil.destination(false);
       */

      function destination (path) {
        if (path === false) {
          var path = localStorage['anvil.connect.destination'];
          delete localStorage['anvil.connect.destination'];
          return path;
        } else if (path) {
          localStorage['anvil.connect.destination'] = path;
        } else {
          return localStorage['anvil.connect.destination'];
        }
      }

      Anvil.destination = destination;


      /**
       * Is Authenticated
       */

      function isAuthenticated () {
        return (Anvil.session.id_token);
      }

      Anvil.isAuthenticated = isAuthenticated;


      /**
       * Signing Key
       */

      function getKeys () {
        var deferred = $q.defer();

        function success (response) {
          setJWK(response.data && response.data.keys);
          deferred.resolve(response.data)
        }

        function failure (fault) {
          deferred.reject(fault);
        }

        $http({
          method: 'GET',
          url: issuer + '/jwks'
        }).then(success, failure);

        return deferred.promise;
      }

      Anvil.getKeys = getKeys;

      // should this be called here or in .run block?
      //Anvil.getKeys().then(function () {
      //  console.log(provider)
      //});


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

