import {base64urlstr2ab, abutf82str} from './ab-utils'

export function decodeSegment (base64url) {
  const utf8ab = base64urlstr2ab(base64url)
  const str = abutf82str(utf8ab)
  const json = JSON.parse(str)
  return json
}

export function segments (token) {
  let tarr = token.split('.')
  let [theader, tpayload, tsignature, ...rest] = tarr
  if (rest.length > 0) {
    throw new Error(`token has ${3 + rest.length} dot '.' separated sections where 3 are expected.`)
  }
  if (tsignature === undefined) {
    throw new Error('token misses signature')
  }
  if (tpayload === undefined) {
    throw new Error('token misses payload')
  }
  if (theader === undefined) {
    throw new Error('token misses header')
  }
  return {
    arr: tarr,
    header: theader,
    payload: tpayload,
    signature: tsignature
  }
}
