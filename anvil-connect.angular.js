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
     * Deserialize session
     */

    //function deserializeSession () {
    //  var re, secret, json, session
    //  try {
    //    re      = new RegExp('[; ]anvil.connect=([^\\s;]*)');
    //    secret  = document.cookie.match(re).pop();
    //    json    = sjcl.decrypt(secret, localStorage['anvil.connect']);
    //    session = JSON.parse(json);
    //  } catch (e) {}
    //  return session;
    //}





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
       * Reinstate an existing session
       */

      Anvil.deserialize();


      /**
       *
       */

      return Anvil;








      //session = deserializeSession();
      /**
       * Anvil Service
       */

      //return {

      //  session: session || {},

        /**
         * Serialize session
         */

      //  serialize: function () {
      //    var now = new Date()
      //      , time = now.getTime()
      //      , exp = time + (response.expires_in || 3600) * 1000
      //      , secret = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(Math.random().toString(36).substr(2, 10)))
      //      ;

      //    now.setTime(exp);
      //    document.cookie = 'anvil.connect=' + secret + '; expires=' + now.toUTCString();
      //    session = sjcl.encrypt(secret, JSON.stringify(response));
      //    localStorage['anvil.connect'] = session;
      //    console.log('SERIALIZED', session);
      //  },


        /**
         * Deserialize session
         */

      //  deserialize: function () {
      //    var re, secret, json, parsed;

      //    try {
      //      // Use the cookie value to decrypt the session in localStorage
      //      re      = new RegExp('[; ]anvil.connect=([^\\s;]*)');
      //      secret  = document.cookie.match(re).pop();
      //      json    = sjcl.decrypt(secret, localStorage['anvil.connect']);
      //      parsed  = JSON.parse(json);

      //    } catch (e) {
      //      console.log('Cannot deserialize session data');
      //    }

      //    session = parsed;
      //    console.log('DESERIALIZED', session);
      //  },


        /**
         * Signin
         */

      //  authorize: function (authorization) {
      //    // handle the auth response
      //    if (authorization) {
      //      var deferred = $q.defer()
      //        , response = parseFormUrlEncoded($location.hash())
      //        ;

      //      // handle authorization error
      //      if (response.error) {
      //        deferred.reject(response);
      //        console.log('ERROR', response)
      //        // clear localStorage/cookie?
      //      }

      //      // handle successful authorization
      //      else {
      //        // TODO:
      //        // - verify id token
      //        // - verify nonce
      //        // - verify access token (athash claim)
      //        // - expose userinfo as a property of the service


      //        this.session = session = response;

      //        this.userInfo().then(
      //          function userInfoSuccess (userInfo) {
      //            session.userInfo = userInfo;

      //            var now = new Date()
      //              , time = now.getTime()
      //              , exp = time + (response.expires_in || 3600) * 1000
      //              , secret = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(Math.random().toString(36).substr(2, 10)))
      //              ;

      //            now.setTime(exp);
      //            document.cookie = 'anvil.connect=' + secret + '; expires=' + now.toUTCString();
      //            session = sjcl.encrypt(secret, JSON.stringify(response));
      //            console.log('NEW SESSION', session)
      //            localStorage['anvil.connect'] = session;
      //            deferred.resolve(response);
      //          },
      //          function userInfoFailure () {}
      //        );
      //      }

      //      return deferred.promise;
      //    }

      //    // initiate the auth flow
      //    else {
      //      // open the signin page in a popup window
      //      if (display === 'popup') {
      //        $window.open(this.uri(), 'authorize', 'width=500, height=600');
      //      }

      //      // navigate the current window to the provider
      //      else {
      //        $window.location = this.uri();
      //      }
      //    }
      //  },


        /**
         * Urls
         */

      //  urls: urls,


        /**
         * Quick and dirty uri method with nonce
         */

      //  uri: function (endpoint) {
      //    return issuer + '/'
      //         + (endpoint || 'authorize') + '?'
      //         + encodedParams
      //         + '&nonce=' + this.nonce()
      //         ;
      //  },


        /**
         * Create or verify a nonce
         */

      //  nonce: function (nonce) {
      //    if (nonce) {
      //      return (this.sha256url(localStorage['nonce']) === nonce);
      //    } else {
      //      localStorage['nonce'] = Math.random().toString(36).substr(2, 10);
      //      return this.sha256url(localStorage['nonce']);
      //    }
      //  },


        /**
         * Base64url encode a SHA256 hash of the input string
         */

      //  sha256url: function (str) {
      //    return sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(str));
      //  },


        /**
         * Parse uri fragment response from Anvil Connect
         */

      //  response: function () {
      //    return parseFormUrlEncoded($location.hash());
      //  },


        /**
         * Headers
         */

      //  headers: function (headers) {
      //    if (this.session.access_token) {
      //      return angular.extend(headers || {}, {
      //        'Authorization': 'Bearer ' + this.session.access_token
      //      });
      //    } else {
      //      return headers;
      //    }
      //  },


        /**
         * Request
         */

      //  request: function (config) {
      //    var deferred = $q.defer();

      //    config.headers = this.headers(config.headers);

      //    function success (response) {
      //      deferred.resolve(response.data);
      //    }

      //    function failure (fault) {
      //      deferred.reject(fault);
      //    }

      //    $http(config).then(success, failure);

      //    return deferred.promise;
      //  },


        /**
         * UserInfo
         */

      //  userInfo: function () {
      //    return this.request({
      //      method: 'GET',
      //      url: this.urls.userinfo
      //    });
      //  }

      //}

      /**
       * OAuth Request
       */

      //function oauth (config) {
      //  var deferred = $q.defer();

      //  if (!config.headers) { config.headers = {} }
      //  config.headers['authorization'] = 'bearer '
      //                                  + oauth.credentials.access_token
      //                                  ;

      //  function success (response) {
      //    deferred.resolve(response.data);
      //  }

      //  function failure (fault) {
      //    deferred.reject(fault);
      //  }

      //  $http(config).then(success, failure);
      //  return deferred.promise;
      //}


      /**
       * Authorize
       */

      //OAuth.authorize = function (authorization) {

      //  // in this case, we're handling the authorization response
      //  if (authorization) {
      //    var deferred    = $q.defer()
      //      , credentials = parseFormUrlEncoded(authorization)
      //      ;

      //    // handle authorization error
      //    if (credentials.error) {
      //      deferred.reject(credentials);
      //      OAuth.clearCredentials();
      //    }

      //    // handle successful authorization
      //    else {
      //      deferred.resolve(credentials);
      //      OAuth.setCredentials(credentials);
      //    }

      //    return deferred.promise;
      //  }

      //  // in this case, we're initiating the flow
      //  else {
      //    OAuth.redirect(urls.authorize);
      //  }

      //};


      /**
       * Redirect
       */

      //OAuth.redirect = function (url) {
      //  $window.location = url;
      //}


      /**
       * Popup
       */


      /**
       * Account info
       */

      //OAuth.accountInfo = function () {
      //  return OAuth({
      //    url: urls.account,
      //    method: 'GET'
      //  });
      //}


      /**
       * Authorized
       */

      //OAuth.authorized = function () {
      //  return Boolean(this.credentials && this.credentials.access_token);
      //};


      /**
       * Check authorization
       */

      //OAuth.checkAuthorization = function () {
      //  var json = localStorage['credentials'];
      //  if (typeof json === 'string') {
      //    OAuth.credentials = JSON.parse(json);
      //  }
      //}


      /**
       * Clear credentials
       */

      //OAuth.clearCredentials = function () {
      //  delete OAuth.credentials;
      //  delete localStorage['credentials'];
      //};


      /**
       * Set credentials
       */

      //OAuth.setCredentials = function (credentials) {
      //  OAuth.credentials = credentials;
      //  localStorage['credentials'] = JSON.stringify(credentials);
      //};


      /**
       * Expose urls
       */

      //OAuth.urls = urls;


      /**
       * Provider
       */

      //OAuth.provider = provider;


      /**
       *
       */

      //OAuth.checkAuthorization();


      /**
       *
       */

      //return OAuth;

    }];


  })

