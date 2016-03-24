# Implementation notes about this code

## WebCrypto

### Testing

Scenario server is running on a mac (macdev) in the LAN but want
to test IE running on a windows computer.

You can use devd on the Windows computer to proxy requests as follows:

```command
C:\Users\dev\bin>devd /=http://macdev:8080
```

Then on the Windows PC one can open IE or other browser on goto http://localhost


### Issues found:

[WebCryptoAPI: importing jwk with use field fails | Microsoft Connect](https://connect.microsoft.com/IE/feedbackdetail/view/2242108/webcryptoapi-importing-jwk-with-use-field-fails)

### Status

* [diafygi/webcrypto-examples](https://github.com/diafygi/webcrypto-examples/)

* [jedie/WebCrypto-compatibility: "Web Cryptography API" compatibility informations](https://github.com/jedie/WebCrypto-compatibility)

* [W3C Web Cryptography Wiki](https://www.w3.org/2012/webcrypto/wiki/Main_Page)

* IE 11 and Edge: [Developer Resources : Microsoft Edge Dev](https://dev.windows.com/en-us/microsoft-edge/platform/status/webcryptoapi)

  * Bugs for Edge IE via https://connect.microsoft.com/IE/feedbackdetail/view/2242108/webcryptoapi-importing-jwk-with-use-field-fails

* [Bug 122679 – \[Meta\] Implement WebCrypto SubtleCrypto interface](https://bugs.webkit.org/show_bug.cgi?id=122679)

* Implementation WebKit tests: [crypto in trunk/LayoutTests – WebKit](http://trac.webkit.org/browser/trunk/LayoutTests/crypto#subtle)

* Chrome: [Issue 245025 - chromium - Implement WebCrypto - An open-source project to help move the web forward. - Google Project Hosting](https://code.google.com/p/chromium/issues/detail?id=245025#c280)


* Firefox:
  * [865789 – (web-crypto) Implement W3C Web Crypto API](https://bugzilla.mozilla.org/show_bug.cgi?id=865789)

  * [WebCrypto Feature Matrix - Google Sheets](https://docs.google.com/spreadsheets/d/1IcevZuPg-_7Lfoi_I_55Gs8ToHjVcW-Lopo7uvqoJFU/edit#gid=1)

### Standard error codes
http://www.w3.org/TR/WebCryptoAPI/#dfn-DataError
see also [WebIDL Level 1](https://www.w3.org/TR/WebIDL-1/)


### Chrome implementation pointers

* [Prefer Secure Origins For Powerful New Features - The Chromium Projects](https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features)

* [content/child/webcrypto/jwk.cc - chromium/src - Git at Google](https://chromium.googlesource.com/chromium/src/+/063854ec9dca4c3a460812c3eddf54eb7f9588dd/content/child/webcrypto/jwk.cc)
* [webcrypto/ - Code Search](https://code.google.com/p/chromium/codesearch#chromium/src/components/webcrypto/&sq=package:chromium&type=cs)

### Other libraries:

* [cisco/node-jose](https://github.com/cisco/node-jose#keys-and-key-stores)
* [ietf-jose/cookbook](https://github.com/ietf-jose/cookbook)

## JavaScript and UTF-8

JavaScript (JS) exposes characters (charCode) in a string as *ucs-2*.
*ucs-2* does not map unicode characters outside of the BMP `[0000-ffff]` 16-bit range.
However one can use two surrogate characters inside a ucs-2 string to represent
a unicode character outside of the BMP.

ES6 supports code points (codePoint).
Code points are available for all unicode characters in `[0-10ffff]` 21 bit range.
It appears this means that ES6 supports surfacing UTF-16 encoded strings
inside of a JavaScript string as sequences of code points.

If this seems new to you reading these articles should help:
* [JavaScript’s internal character encoding: UCS-2 or UTF-16? · Mathias Bynens](https://mathiasbynens.be/notes/javascript-encoding)
* [JavaScript has a Unicode problem · Mathias Bynens](https://mathiasbynens.be/notes/javascript-unicode)
* [New string features in ECMAScript 6](http://www.2ality.com/2015/01/es6-strings.html)

## UTF-8 used in this code base
### JWS token
JWS tokens have three segments. The first two, the header and payload
represent JSON objects.

These segments are encoded as base64url encoding of the
bytes of the UTF-8 representation of JSON string:

  `base64url` encoded string -> utf8 bytes -> JSON JS string -> JS Object

See also [Online Base64URL decoder](http://kjur.github.io/jsjws/tool_b64udec.html)

### Anvil.promise.sha256url(str)

Here the encoding is done as follows:

  JS String -> UTF-8 encoded bytes -> sha256 bytes -> base64url encoded bytes


### Thoughts on the implementation of UTF-8 support

There is a TextEncoder,TextDecoder standard API which however is not yet
supported across the board. The general polyfill would be quite large as this
supports more encodings than just UTF-8.

I did not find UTF-8 encodes/decoders coded in ES6 yet. Compared to implementing
this in ES5 the ES6 implementation should be relatively
straightforward to code as iterators will advance over unicode points
simply like this:
for (let c of str) {
  let cp = ch.codePointAt(0)  do something with code point.


However at the moment I'd rather use a library already available, the [TextEncoderLite library](https://github.com/coolaj86/TextEncoderLite) for this (on Github [inexorabletash/text-encoding](https://github.com/inexorabletash/text-encoding)

This is not a major endorsement for that library, but I did not find anything
wrong with it, it is
lean and mentioned on the [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob()_and_btoa()_using_TypedArrays_and_UTF-8)
A different character encoding such as UTF-8 would come to play only if
one has to map a character string to a sequence of bytes.

An alternative as [dissected here](http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html) would be to use:

``` JavaScript
function encode_utf8( s ) {
  return unescape( encodeURIComponent( s ) );
}

function decode_utf8( s ) {
  return decodeURIComponent( escape( s ) );
}
```

The following led me away from this approach:
  1. `escape` and `unescape` are deprecated
  2. Needed to produce bytes not characters.
  3. Looked rather inefficient.

Further general references on working with ArrayBuffers:

* [JavaScript typed arrays - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
* [How to convert ArrayBuffer to and from String | Web Updates - Google Developers](https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en)

## JWK

Some handy tools for working with PEMs

```console

$ ./bin/pem-jwk.js connect-js-test.pub.jwk
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAnhubIr98ugQw+6JHq4c5aWGMlFAU+6dXFYewby7A+d4mY/EIY9tu
jJWUIa0PXGx8e3KAi7vOF81tvUCIdbmlzduLWTy50zcIdBRO6d65020yQg4Mab+l
NXedDVMfW2v15uq5PfrQNMSGSaO//ktnCyc4DQcB//cYb1+7yCXnmaGkqfKFamRu
sevK6HxzHyFTMvCLlGvmADUiuFA/1IVfbLryy5JLTCnsehBMiJ7oRfL8bY4mLuSo
lLRSORcrtk+p/no4YGb5OVgGbDJd1ZndsGCWeU+MFvrt7FIyJeaL7J54Vrna1Ytm
U6o1/oJZvZes1/o9YLG3Q1ntXcc86uM6YwIDAQAB
-----END RSA PUBLIC KEY-----

$ ./bin/pem-jwk.js connect-js-test.pub.jwk  > connect-js-test.pub.pem

$ CONNECT_PEM=$(grep -v "PUBLIC KEY" connect-js-test.pub.pem | tr -d '\n')
# on OSX: linux uses base64 -d I believe
$ echo $CONNECT_PEM | base64 -D | openssl asn1parse -inform DER -i
    0:d=0  hl=4 l= 266 cons: SEQUENCE          
    4:d=1  hl=4 l= 257 prim:  INTEGER           :9E1B9B22BF7CBA0430FBA247AB873969618C945014FBA7571587B06F2EC0F9DE2663F10863DB6E8C959421AD0F5C6C7C7B72808BBBCE17CD6DBD408875B9A5CDDB8B593CB9D3370874144EE9DEB9D36D32420E0C69BFA535779D0D531F5B6BF5E6EAB93DFAD034C48649A3BFFE4B670B27380D0701FFF7186F5FBBC825E799A1A4A9F2856A646EB1EBCAE87C731F215332F08B946BE6003522B8503FD4855F6CBAF2CB924B4C29EC7A104C889EE845F2FC6D8E262EE4A894B45239172BB64FA9FE7A386066F93958066C325DD599DDB06096794F8C16FAEDEC523225E68BEC9E7856B9DAD58B6653AA35FE8259BD97ACD7FA3D60B1B74359ED5DC73CEAE33A63
  265:d=1  hl=2 l=   3 prim:  INTEGER           :010001

```

References:

* [encryption - RSA Public Key format - Stack Overflow](http://stackoverflow.com/questions/12749858/rsa-public-key-format)
* [openssl - RSA: Get exponent and modulus given a public key - Stack Overflow](http://stackoverflow.com/questions/3116907/rsa-get-exponent-and-modulus-given-a-public-key/3117100#3117100)
* [ASN.1 key structures in DER and PEM - Knowledge Base - mbed TLS (Previously PolarSSL)](https://tls.mbed.org/kb/cryptography/asn1-key-structures-in-der-and-pem)
