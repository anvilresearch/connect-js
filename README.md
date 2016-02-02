# Anvil Connect JavaScript Client
[![Build Status](https://travis-ci.org/anvilresearch/connect-js.svg?branch=master)](https://travis-ci.org/anvilresearch/connect-js)

## Install
There is currently work in progress to update the client libraries to use
webcrypto APIs instead of encryption libraries. See
[Webcrypto API · Issue #7 · anvilresearch/connect-js](https://github.com/anvilresearch/connect-js/issues/7) for more details.

To get the webcrypto code for testing a fork is used:

```console
$ # create or got to some suited directory then
$ git clone https://github.com/henrjk/connect-js.git
$ cd connect-js
$ git checkout webcrypto
```

Next install and verify that the tests pass:
```console
$ npm install
$ npm run test  ## this should open a karma test run in Chrome.
```

In case this work is accepted it would presumable be published on npm. Then the install would just be:
```console
$ npm install anvil-connect-js
```

### API Documentation

#### Initialization and provider configuration

##### Anvil.configure(options)
<!--
lorem ipsum dolor amit

**Arguments**

- `prop` – description
- `prop` – description
- `prop` – description

**Examples**

```javascript
// ...
```
-->

##### Anvil.init(providerOptions, apis)
since 0.2.0

providerOptions same as for Anvil.configure().

Examples:

* src/anvil-connect-angular.js
* src/anvil-connect-plain.js

#### Anvil.promise.prepareAuthorization
since 0.2.0

Does initializations which may require network calls.
Returns a promise.

#### Main API methods

##### Anvil.session

Current session object.

##### Emits 'authenticated' event
since 0.2.0
This uses TinyEmitter so that on can use the corresponding
method on the Anvil instance.

Example:
```JavaScript
    Anvil.once('authenticated', function (session) {
      // do something like this:
      log('authenticated', session)
      })
```

##### Anvil.isAuthenticated()

This method returns truthy if the user's id token has been established in
the session.


##### Anvil.toFormUrlEncoded(obj)
##### Anvil.parseFormUrlEncoded(str)
##### Anvil.getUrlFragment(url)
##### Anvil.promise.deserialize()
since 0.2.0

Establishes session based on localStorage and/or cookies.

Returns a promise

##### Anvil.promise.authorize()
since 0.2.0: was promise before but is no longer available under Anvil.authorize()

##### Anvil.promise.callback(response)
since 0.2.0: was promise before but is no longer available under Anvil.callback()

##### Anvil.promise.uri()
since 0.2.0

Can be used to connect the connect server.

Returns a promise

Example:
```JavaScript
    Anvil.promise.uri('authorize', {
      prompt: 'none',
      id_token_hint: Anvil.session.id_token}).then( function (uri) {
        window.location = uri
      })
```

##### Anvil.signout(path)

Signs out with the connect server.

This redirects the current page to the signout endpoint.
The server is expected to redirect the browser to the path.
The (destination) path is stored in localStorage and can be retrieved with
`Anvil.destination()`.
The functions also calls Anvil#reset

Example:
```JavaScript
Anvil.signout('/')
```
##### Anvil.reset()

Clears browser session state in localStorage, cookies and Anvil object.

##### Anvil.destination(path)

Gets/set/deletes Anvil destination path in localStorage.

Examples:
```JavaScript
// Set the destination
Anvil.destination('/')

// Get the destination
Anvil.destination()

// Clear the destination
Anvil.destination(false)
```

### Support for session protocol
##### Anvil.checkSession(id)
##### Anvil.updateSession(event)

#### Internal API.
The internal API is published mostly to support unit testing.

It may be changed at any time.
##### Anvil.popup(popupWidth, popupHeight)
##### Anvil.promise.serialize()
since 0.2.0 this is a promise
##### Anvil.promise.nonce()
since 0.2.0 this is a promise
##### Anvil.promise.sha256url()
since 0.2.0 this is a promise
##### Anvil.headers()
##### Anvil.promise.request()
since 0.2.0: was promise before but is no longer available under Anvil.request()
##### Anvil.promise.userInfo()
since 0.2.0: was promise before but is no longer available under Anvil.userInfo()

### AngularJS Usage

**NOTE**: The information below applies to master and is mostly stale.

It is suggested to look at https://github.com/henrjk/connect-example-angularjs/
for the webcrypto supporting version.

A main difference is that the new example uses npm and browserify. Of course
you may adapt and use different tooling.

Note that the latest sources are in ES2015 (ES6).

Be sure to [register your app as a client](https://github.com/anvilresearch/connect-docs/blob/master/clients.md#registration) with your Anvil Connect provider to obtain credentials.

#### Authenticate with a popup window

First copy `callback.html` from this repository into your public assets, and add `anvil-connect-angular.js` to your `index.html` file.

```html
<script src="bower_components/angular/angular.js"></script>
<!-- ... -->
<script src="bower_components/sjcl/sjcl.js"></script>
<script src="bower_components/anvil-connect/anvil-connect.angular.js"></script>
<!-- ... -->
<script src="scripts/app.js"></script>
<!-- ... -->
```


Then you can load the module and configure the provider.

```javascript
angular.module('App', ['...', 'anvil'])

  .config(function (..., AnvilProvider) {

    AnvilProvider.configure({
      issuer:       'http://localhost:3000',
      client_id:    '<CLIENT_ID>',
      redirect_uri: '<YOUR_APP_HOST>/callback.html',
      display:      'popup'
    });

    // ...

  })
```

You can inject the Anvil service into your controllers and call `Anvil.promise.authorize()` wherever you want to initiate an OpenID Connect authentication flow.

```javascript
  .controller(function ($scope, ..., Anvil) {
    $scope.signin = function () {
      Anvil.promise.authorize();
    };
  })
```


#### Authenticate with full page navigation

Configuring the service to use full page navigation is similar to popup configuration, but requires a route definition to handle the authorization response from Anvil Connect:

```javascript
angular.module('App', ['...', 'anvil'])

  .config(function (..., $routeProvider, AnvilProvider) {

    AnvilProvider.configure({
      issuer:       'http://localhost:3000',
      client_id:    '<CLIENT_ID>',
      redirect_uri: '<YOUR_APP_HOST>/callback',
      // `display` defaults to "page"
    });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';

    $routeProvider

      // ...

      .when('/callback', {
        resolve: {
          session: function ($location, Anvil) {
            Anvil.promise.authorize().then(
              function (response) {
                $location.url('/');
              },
              function (fault) {
                // your error handling
              }
            )
          }
        }
      })

      // ...

  })
```
