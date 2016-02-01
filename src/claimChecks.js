/*

 ## ID Token Validation:
 iss claim must match
 aud claim: must validated that aud claim contains ist client_id value (aud array of strings)
 See 2.2.1 below for details in particular checking of azp in case there are
 multiple aud.
 exp: required
 iat: required
 nonce: required
 at_hash: required

 http://openid.net/specs/openid-connect-implicit-1_0.html#rfc.section.2.2.1

 Must validate signature

 ## Access token validation: http://openid.net/specs/openid-connect-implicit-1_0.html#rfc.section.2.2.2

 Open ID Connect does not say much about the structure of an access token.
 However OAuth2 defined field token_type, expires_in, refresh_token, scope
 in https://tools.ietf.org/html/rfc6749#section-5.1

 However 2.2.2 says that clients SHOULD validate the at_hash of the ID_Token
 against the access token. The at hash is checked elsewhere

 Now the anvil connect server does issue JWTs as access token, so that this
 client can do more validation. The JWT issued contains the following claims as
 per example:
 "jti": "748ff8eed8c996b6f898",
 "iss": "http://connect.example.com:3000",
 "sub": "c43f3fc8-048a-457a-9cff-0a25d6e4e6f0",
 "aud": "cb4d671a-c02a-4ac6-a2b4-f6d58f4ea783",
 "exp": 1454012671,
 "iat": 1454009071,
 "scope": "openid profile"
 It is also signed.

 [Draft: OpenID Connect Implicit Client Implementer's Guide 1.0 - draft 20](http://openid.net/specs/openid-connect-implicit-1_0.html#rfc.section.2.2.1)
 */

function toStr (val) {
  // array is already handled here.
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return val
}

function valstof (val) {
  return Array.isArray(val)
    ? [`[${val}]`, 'array']
    : [toStr(val), typeof val]
}

// internal api
export function checkNumberClaims (claims, names) {
  let values = []
  for (let name of names) {
    let val = claims[name]
    let [vals, tof] = valstof(val)
    if (tof !== 'number') {
      throw new Error(`token must have ${name} claim of type number not ${tof} (${vals})`)
    }
    values.push(val)
  }
  return values
}

// internal api
export function checkStringClaims (claims, names) {
  let values = []
  for (let name of names) {
    let val = claims[name]
    let [vals, tof] = valstof(val)
    if (tof !== 'string') {
      throw new Error(`token must have ${name} claim of type string not ${tof} (${vals})}`)
    }
    if (val.trim().length === 0) {
      throw new Error(`token must have ${name} claim of type string which is not empty`)
    }
    values.push(val)
  }
  return values
}

// internal api
export function checkStringArrayClaims (claims, names) {
  let values = []
  for (let name of names) {
    let val = claims[name]
    let [vals, tof] = valstof(val)
    if (tof === 'array') {
      if (val.length === 0) {
        throw new Error(`token with invalid ${name} claim: must be an array of strings not an empty array (${vals})`)
      }
      val.forEach((v) => {
        let [, tof] = valstof(v)
        if (tof !== 'string') {
          throw new Error(`token with invalid ${name} claim: contains element which is not a string (${vals})`)
        }
      })
      values.push(val)
      // good value
    } else {
      throw new Error(`token must have ${name} claim: must be string or array of strings not ${tof} (${vals})`)
    }
  }
  return values
}

// internal api
export function checkStringOrStringArrayClaims (claims, names) {
  let values = []
  for (let name of names) {
    let val = claims[name]
    let [vals, tof] = valstof(val)
    if (tof === 'array') {
      if (val.length === 0) {
        throw new Error(`token with invalid ${name} claim: must be string or array of strings not an empty array (${vals})`)
      }
      val.forEach((v) => {
        let [, tof] = valstof(v)
        if (tof !== 'string') {
          throw new Error(`token with invalid ${name} claim: contains element which is not a string (${vals})`)
        }
      })
      values.push(val)
      // good value
    } else if (tof === 'string') {
      values.push([val])
    } else {
      throw new Error(`token must have ${name} claim: must be string or array of strings not ${tof} (${vals})`)
    }
  }
  return values
}

// internal api
export function check_aud_azp (claims, client_id) {
  const [aud] = checkStringOrStringArrayClaims(claims, ['aud'])
  let azpChecked = false
  if ('azp' in claims) {
    var [azp] = checkStringClaims(claims, ['azp'])
    if (azp !== client_id) {
      throw new Error(`token rejected: azp '${azp}' claim does not match this client id '${client_id}'`)
    }
    azpChecked = true
  }
  if (!(aud.length === 1 && azpChecked)) {
    if (aud.indexOf(client_id) === -1) {
      throw new Error(`token rejected: aud '${aud}' does not mention this clients id '${client_id}'`)
    }
  }
}
/*
Potential references for access token validation:

* [Final: OpenID Connect Core 1.0 incorporating errata set 1](http://openid.net/specs/openid-connect-core-1_0.html#rfc.section.9)
* Access token validation: http://openid.net/specs/openid-connect-implicit-1_0.html#rfc.section.2.2.2

  Open ID Connect does not say much about the structure of an access token.
  However OAuth2 defined field token_type, expires_in, refresh_token, scope
  in https://tools.ietf.org/html/rfc6749#section-5.1

However 2.2.2 says that clients SHOULD validate the at_hash of the ID_Token
against the access token. The at hash is **not** checked by this function.

Now the anvil connect server does issue JWTs as access token, so that this
client can do more validation. The JWT issued contains the following claims as
per example:
  "jti": "748ff8eed8c996b6f898",
  "iss": "http://connect.example.com:3000",
  "sub": "c43f3fc8-048a-457a-9cff-0a25d6e4e6f0",
  "aud": "cb4d671a-c02a-4ac6-a2b4-f6d58f4ea783",
  "exp": 1454012671,
  "iat": 1454009071,
  "scope": "openid profile"
It is also signed.

*/
export function checkAccessClaims (claims, {issuer, client_id}) {
  if (!claims) {
    throw new Error('token with empty claims rejected')
  }
  const now = new Date() / 1000
  const [iat, exp] = checkNumberClaims(claims, ['iat', 'exp'])
  const [, iss] = checkStringClaims(claims, ['jti', 'iss', 'sub'])

  if (iat > now) {
    throw new Error('token invalid: issued at (iat) in the future.')
  }
  if (now > exp) {
    throw new Error('token is expired.')
  }
  if (iss !== issuer) {
    throw new Error(`token iss '${iss}' does not match '${issuer}'`)
  }

  check_aud_azp(claims, client_id)

  return claims
}
/*

 id_claims: {
 "iss": "http://connect.example.com:3000",
 "sub": "c43f3fc8-048a-457a-9cff-0a25d6e4e6f0",
 "aud": "cb4d671a-c02a-4ac6-a2b4-f6d58f4ea783",
 "exp": 1454065209,
 "iat": 1454061609,
 "nonce": "1Vwkv2rpxLkAp6xYV_VRgRiYj2aNpTC9ylnnAxqQ0CA",
 "at_hash": "b528d002387a20122a631c48e1f4ce60",
 "amr": [
   "pwd"
 ]
 },

 */

export function checkIdClaims (claims, {issuer, client_id}) {
  if (!claims) {
    throw new Error('token with empty claims rejected')
  }
  const now = new Date() / 1000
  const [iat, exp] = checkNumberClaims(claims, ['iat', 'exp'])
  if (iat > now) {
    throw new Error('token invalid: issued at (iat) in the future.')
  }
  if (now > exp) {
    throw new Error('token is expired.')
  }
  const [iss] = checkStringClaims(claims, ['iss', 'sub', 'nonce', 'at_hash'])
  checkStringArrayClaims(claims, ['amr'])
  check_aud_azp(claims, client_id)

  if (iss !== issuer) {
    throw new Error(`token iss '${iss}' does not match '${issuer}'`)
  }

  return claims
}
