/* eslint-disable quotes */
import {encodeJWSSegment} from './tlib'

// could not export private key so had to use real data!
// some real data:
export const real_data = {
  jwk: {
    'kty': 'RSA',
    'use': 'sig',
    'alg': 'RS256',
    'n': '2PM7X5whLvIU88kHnsRoL-Xg2XD5ex8VNomTT-PhMaH6so9QW18-FmVG4l3ogP9M9ZVrX4UAAnS0Io5g-f0wieXDh0KvF9I3OZI8s1sWWj5Edb8sxBasH_eok15azRE6n_TUXgH-vu65k4q2AImDWDGvVsDSDiY2YdTjQMsgo2z6kst57rhwz60Q4tcneqGXpZ9okkxTIg4bj97T8remdfzoYtbVVdJdauImkay1zg4gOPdTTmdz0dvHCqMuWMtygjwI0hXxcAVQHM2Kub2oAVGpwyV659p0fM0qH21F4cv55D26MR7EFE0rjP2evBgcfOiNVnIX-BhMj3xulBby4nYFykzuyXt8w968n7aSfqU7BtY0RMqSg7IqIAVuEcQUT7xM781582cizh0ydyBjETgARTRAXcM_1vpJ5Q2zx9oCSXvuQYZ-vaBM_j5AvSPcrsR_0Sbp6JLWDRldmEQvfoIIMJGsRPPKvxsMCAhL4abEKhxc1qMi10OW-hNXfMibMKEgLIRVUr-gZAp4T41ek6uGx1ULaUzhm3-vdqJEKI8NwyLnvfToLVGSHkcbWug5uSPoC8VfIYyDQv290xRGjziXsLUHOEf0CWw66YG-3THF4MzG2Xh-dVAH0a6CN8fkLUXD43wuUQixBqpbyhLdjrCf8gPSgf-7icilppNm0_8',
    'e': 'AQAB'
  },

  access_token: 'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4M2ZmZWQyZmY2OTkzODZlODkyYSIsImlzcyI6Imh0dHA6Ly9jb25uZWN0LmV4YW1wbGUuY29tOjMwMDAiLCJzdWIiOiJjNDNmM2ZjOC0wNDhhLTQ1N2EtOWNmZi0wYTI1ZDZlNGU2ZjAiLCJhdWQiOiJjYjRkNjcxYS1jMDJhLTRhYzYtYTJiNC1mNmQ1OGY0ZWE3ODMiLCJleHAiOjE0NTQwNjUyMDksImlhdCI6MTQ1NDA2MTYwOSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSJ9.YazvEyngmgJhCRnphTgAZ4w-SpxDkuaw9uuj27NWdYQJE22BlTNeXrnvTt2FQPtB_xxHBCyWRaht9xHmhXZ1VltnlD3JK1tmn2irw48OC7FSGujoA0qq_tbGQyroedT3abUeMALEzF_TwmRDQZ-8wXLHZ5OJcavO2ERM8IISm50nhdLvrU31LN-R1nliwrkkr5KtXV-thQOYRpF_5IcGnEzw1owaxZHGds5Y6b5vvCcx8GwaP6tQ0JyRAOiIyw_s8j9zUrpfYKpAw5juTcjVeppW5sJwTq45wX_51khdND2SyCvhoBeAtz_8DClg1obfMAMTDB14qYNGFN12wUMEtPlKs2BL4xO9ZF5ZJR9q1SxV70AmcniJ-KerCmigbsVl7jGo2YpSWgO_zQDaFHpCwsvFkONpaMisU_ugQrAM5d86CPWrElx2SakLE6oNG3TDM6f7Fi65Lj2sdrAqmU5ThHELSabqMjgkqa_HYE-lSy2GFm7QnARmlR1TEBIjVFeA5TzPCwOs_kECvOF-NCmp7baNWCnPinVMpG6UqhjDrlh6SHMbh1ypfrZzWWMtDPa9mlqW5UErf6dOAG6H7AJ8oHSUoLmC_mB9wo-ujnP5_ZICiROhFD40YPtv16S12n9duE3p-zncFRwJ5AzcTm3PtGNoNaxxP7YoyX0flHVjHXk',

  access_claims: {
    "jti": "83ffed2ff699386e892a",
    "iss": "http://connect.example.com:3000",
    "sub": "c43f3fc8-048a-457a-9cff-0a25d6e4e6f0",
    "aud": "cb4d671a-c02a-4ac6-a2b4-f6d58f4ea783",
    "exp": 1454065209,
    "iat": 1454061609,
    "scope": "openid profile"
  },
  id_token: 'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwOi8vY29ubmVjdC5leGFtcGxlLmNvbTozMDAwIiwic3ViIjoiYzQzZjNmYzgtMDQ4YS00NTdhLTljZmYtMGEyNWQ2ZTRlNmYwIiwiYXVkIjoiY2I0ZDY3MWEtYzAyYS00YWM2LWEyYjQtZjZkNThmNGVhNzgzIiwiZXhwIjoxNDU0MDY1MjA5LCJpYXQiOjE0NTQwNjE2MDksIm5vbmNlIjoiMVZ3a3YycnB4TGtBcDZ4WVZfVlJnUmlZajJhTnBUQzl5bG5uQXhxUTBDQSIsImF0X2hhc2giOiJiNTI4ZDAwMjM4N2EyMDEyMmE2MzFjNDhlMWY0Y2U2MCIsImFtciI6WyJwd2QiXX0.Vy4etGGgbVH3kHclHRVVqIjqQiZkzyN1TT7Xi6HjAW1cLGufwf8CcA8EJb18-frVW_2GBS9JK9mCHNL54I31g3aVIdnLl9fQxvITFJWJzWH4DHtD7F6tt3fhUZb0AdeWENm_19cKsZ6kLRsEUaPht2-QaCiswdXyH-xiMqDMze_VyizGxx_2WjK5ETtiEjraJd82QpLgFDvWrYibsKN5N6Vo9PWqFU4Du1oBxxpLP-kjBF_wL35VWU6um3BfFOb2DjQpE-7RB8DFYB60IXMN6MJD2yni84Mr9Jm0jA24ozdr2fg1U9iXqC9IEot9gRcrGuxAdn3THefYgJPpLySwlYl5SmsT2a0GANChXzURVLEtrOTrcYfC79yWRh87IaABMEx_LOQk_Sfnx8hfq5yzMupEb3UF70Ek_uqrTszAnDK2vXNwDyR5c1xlWwKJbLHpuI9UyfPNmgTX1ze3kNqlcY4qHMInhjVdAVdzG0e54slbmga53i8PzOo9nXxci-nybAU58YbVixTVv7mwTwayV92RKZ6jx83cbDDbB0gytZcH5n2bglp2ZwARXVEgyOeOTiJDUMPlgPQbmd545xckx2yA4jaK0M6JprZvTF3PaFPPm8lCcaChU36Ngp9BRJWpQTI0tMhy1qWD5bRWy3MimDLwAYzr-GoCnjaK8iUUo94',

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

  userInfo: {
    "sub": "c43f3fc8-048a-457a-9cff-0a25d6e4e6f0",
    "family_name": "W",
    "given_name": "P",
    "updated_at": 1446218445857
  }
}

export const access_token = {
  header: {
    'alg': 'RS256'
  },
  payload: real_data.access_claims
}

export const access_token_segments = {
  header: real_data.access_token.split('.')[0],
  payload: real_data.access_token.split('.')[1],
  signature: real_data.access_token.split('.')[2]
}

export function encode_token_to_sign (token) {
  return `${encodeJWSSegment(token.header)}.${encodeJWSSegment(token.payload)}`
}

const ats = access_token_segments
export const access_token_encoded = real_data.access_token

export const access_token_encoded_bad_signature = `${ats.header}.${ats.payload}.${ats.header}`

export const access_token_encoded_alg_none = `eyJhbGciOiJub25lIn0.${ats.payload}.${ats.signature}`

export const id_token = {
  header: {
    'alg': 'RS256'
  },
  payload: real_data.id_claims
}

export const id_token_segments = {
  header: real_data.id_token.split('.')[0],
  payload: real_data.id_token.split('.')[1],
  signature: real_data.id_token.split('.')[2]
}

