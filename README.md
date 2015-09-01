# Anvil Connect JavaScript Client

### Install

```bash
$ bower install anvil-connect --save
```

### AngularJS Usage

Be sure to [register your app as a client](https://github.com/anvilresearch/connect/wiki/Dynamic-Client-Registration) with your Anvil Connect provider to obtain credentials.



#### Authenticate with a popup window

First copy `callback.html` from this repository into your public assets, and add `anvil-connect.angular.js` to your `index.html` file.

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

You can inject the Anvil service into your controllers and call `Anvil.authorize()` wherever you want to initiate an OpenID Connect authentication flow.

```javascript
  .controller(function ($scope, ..., Anvil) {
    $scope.signin = function () {
      Anvil.authorize();
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
            Anvil.authorize().then(
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

