# Anvil Connect JavaScript Client

## Install

```bash
$ bower install anvil-connect --save
```

### API Documentation

#### Anvil.configure(options)
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
#### Anvil.toFormUrlEncoded(obj)
#### Anvil.parseFormUrlEncoded(str)
#### Anvil.getUrlFragment(url)
#### Anvil.popup(popupWidth, popupHeight)
#### Anvil.session
#### Anvil.serialize()
#### Anvil.deserialize()
#### Anvil.reset()
#### Anvil.uri()
#### Anvil.nonce()
#### Anvil.sha256url()
#### Anvil.headers()
#### Anvil.request()
#### Anvil.userInfo()
#### Anvil.callback(response)
#### Anvil.authorize()
#### Anvil.signout(path)
#### Anvil.destination(path)
#### Anvil.checkSession(id)
#### Anvil.updateSession(event)
#### Anvil.isAuthenticated()
#### Anvil.getKeys()


### AngularJS Usage

Be sure to [register your app as a client](https://github.com/anvilresearch/connect-docs/blob/master/clients.md#registration) with your Anvil Connect provider to obtain credentials.



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

