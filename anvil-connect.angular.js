'use strict';

angular.module('anvil', [])


  .provider('Anvil', function AnvilProvider () {

    /**
     * Private state
     */

    var issuer, params, encodedParams, urls = {};


    /**
     * Provider configuration
     */

    this.configure = function (issuer, options) {

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

      this.issuer    = issuer;
      this.params    = params;
      this.urls      = urls;

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

    //function parseFormUrlEncoded (str) {
    //  var obj = {};

    //  str.split('&').forEach(function (property) {
    //    var pair = property.split('=')
    //      , key  = pair[0]
    //      , val  = pair[1]
    //      ;

    //    obj[key] = val;
    //  });

    //  return obj;
    //}


    this.$get = ['$q', '$http', '$window', function ($q, $http, $window) {

      /**
       * OAuth Request
       */

      //function OAuth (config) {
      //  var deferred = $q.defer();

      //  if (!config.headers) { config.headers = {} }
      //  config.headers['Authorization'] = 'Bearer '
      //                                  + OAuth.credentials.access_token
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

