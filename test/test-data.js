import {encodeJWSSegment} from './tlib'

export const jwk = {
  'kty': 'RSA',
  'use': 'sig',
  'alg': 'RS256',
  'n': 'wlWwg0-dP3xusMcQjfBxYX-1nGauChcl0fMXpcpl18Vc93G1pPs59_aWPIKnbj0NxirhPgmpn9_SYXvFP9H-s-AXidjLBLBqKAUvQjfLoXDMKgVLLNpEXHKYZOkkwxNdxQxn-8hMX-m3rRnjOysk8K7jR_3_fEZe-8G5HRb26EbZdpcbt5ps_eF5sBN4I5J0h7DZb7zjMlLn4jn84svFZxWTfD87hUDB8BAj9-bjL7kE9TsUmYmyyih6XXQNVEAfWbgrdLEksE3eRzqFo7erlgqt1EYfZfYGYH-HKEMM6Zaq9BrFRBLXZjsZZWf5_6CURyRCslV0LcuRGt-ROYgbvw',
  'e': 'AQAB'
}

export const jwt_token = {
  header: {
    'alg': 'RS256'
  },
  payload: {
    'jti': '4535099f6570b90ce19f',
    'iss': 'http://localhost:3000',
    'sub': '4076f412-374f-4bc6-909a-1d8eb1aa233c',
    'aud': '58148b70-85aa-4726-af7d-42bd109dcc49',
    // valid exp and iat are in seconds and are currently
    // 10 digits long not 13
    'exp': 1413944758,
    'iat': 1413941158,
    'scope': 'openid profile'
  }
}

export const jwt_token_segments = {
  header: encodeJWSSegment(jwt_token.header),
  payload: encodeJWSSegment(jwt_token.payload),
  signature: 'GfGrZjPokx9IDbDkOc_485Zh8S0TT6uGO7qvppwEVWydlfdJos_m2WqYB6-5QDlpLweM7Qzuw0ct4OejJhwuuF7WQgR3qUDMwEHTbmQ5UlyNGtiRLuDT13gTftk4iFe8vLAlXmXM0Y2C5ywdUXjofwnWxr_ZTQAd6iIFS9mou_zsiFGm3YVKh53u70nrfUygUl2Hcrh6eXdF1DpqaTY6J7dnEEB6rEQ27yjiVtZrf61xcxCEsEyZqonPP97BUl88XX_gQDwg39q_e6jKr7jEzeJrq_DwTnC_8OmEDynUvvoTd73wfAn0TKzUyGv4w0uKEuq_DZJhkgSxYMdGO6QH1w'
}

const jts = jwt_token_segments

export const jwt_token_encoded = `${jts.header}.${jts.payload}.${jts.signature}`

export const jwt_token_encoded_bad_signature = `${jts.header}.${jts.payload}.${jts.header}`

export const jwt_token_encoded_alg_none = `eyJhbGciOiJub25lIn0.${jts.payload}.${jts.signature}`
