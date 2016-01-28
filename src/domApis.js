/* eslint-env es6 */
/* global location */

export default {
  location: {
    hash: function () {
      return location.hash.substring(1)
    },
    path: function () {
      return location.pathname
    }
  },
  dom: {
    getWindow: function () {
      return window
    },
    getDocument: function () {
      return document
    }
  }
}

