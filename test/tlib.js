import {str2utf8ab, ab2base64urlstr} from '../src/ab-utils'

export function encodeJWSSegment (jsonObject) {
  const json = JSON.stringify(jsonObject)
  const abUtf8 = str2utf8ab(json)
  const b64url = ab2base64urlstr(abUtf8)
  return b64url
}

