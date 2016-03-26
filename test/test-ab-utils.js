/* eslint-env jasmine */

import {
  hex2ab, ab2hex,
  ab2str, str2ab,
  base64str2ab, ab2base64str,
  base64urlstr2ab, ab2base64urlstr,
  str2utf8ab, abutf82str,
  ascii2ab} from '../src/ab-utils'

describe('Check ab_utils conversion hex to arraybuffer conversion', () => {
  it('hex2ab of empty string is 0 bytes long', () => {
    let ab = hex2ab('')
    expect(ab.byteLength).toBe(0)
  })

  it('hex2ab of odd digits to throw', () => {
    function d1 () {
      hex2ab('0')
    }
    function d3 () {
      hex2ab('012')
    }
    expect(d1).toThrow()
    expect(d3).toThrow()
  })

  it('hex2ab of unexpected characters to throw', () => {
    function bad_digit () {
      hex2ab('xf')
    }
    expect(bad_digit).toThrow()
  })

  it('hex2ab of some test values to check out', () => {
    function expect_hex2ab (hex, expectedArray) {
      let r = hex2ab(hex)
      let v = Array.from(new Uint8Array(r))
      expect(r.byteLength).toBe(expectedArray.length)
      expect(v).toEqual(expectedArray)
    }

    expect_hex2ab('00', [0])
    expect_hex2ab('7589', [7 * 16 + 5, 8 * 16 + 9])
  })
})

describe('Check ab_utils conversion arraybuffer to hex', () => {
  function expect_ab2hex (arr, expectedHex) {
    let v = new Uint8Array(arr.length)
    let i = 0
    for (let b of arr) {
      v[i++] = b
    }

    let str = ab2hex(v)
    expect(str).toEqual(expectedHex)
  }

  it('ab2hex empty array is empty string', () => {
    expect_ab2hex([], '')
  })

  it('ab2hex some values', () => {
    expect_ab2hex([0], '00')
    expect_ab2hex([15, 255, 7], '0fff07')
    expect_ab2hex([7, 128], '0780')
  })
})

describe('Check ab_utils conversion str to arraybuffer', () => {
  it('str2ab of empty string is 0 bytes long', () => {
    let ab = str2ab('')
    expect(ab.byteLength).toBe(0)
  })

  it('str2ab of some test values to check out', () => {
    function expect_str2ab (str, expectedArray) {
      let r = str2ab(str)
      let v = Array.from(new Uint16Array(r))
      expect(v.length).toBe(expectedArray.length)
      expect(v).toEqual(expectedArray)
    }

    expect_str2ab('ABC', [65, 66, 67])
    expect_str2ab('A\u{1F4A9}C', [65, 0xD83D, 0xDCA9, 67])
  })
})

describe('Check ab_utils conversion arraybuffer to str', () => {
  function expect_ab2str (arr, expected) {
    let v = new Uint16Array(arr.length)
    let i = 0
    for (let b of arr) {
      v[i++] = b
    }

    let str = ab2str(v)
    expect(str).toEqual(expected)
  }

  it('ab2str empty array is empty string', () => {
    expect_ab2str([], '')
  })

  it('ab2str some values', () => {
    expect_ab2str([65], 'A')
    expect_ab2str([0x41], 'A')
    expect_ab2str([65, 66, 67], 'ABC')
    expect_ab2str([0xD83D, 0xDCA9], '\u{1F4A9}') // PILE OF POO
    expect_ab2str([0xD83D, 0xDCA9], '\uD83D\uDCA9') // as surrogate pair
    // But not expect_ab2str([1, 0xF4A9], '\u{1F4A9}')
    expect_ab2str([65, 0xD83D, 0xDCA9, 67], 'A\u{1F4A9}C')
  })
})

describe('Check ab_utils base64 support', () => {
  const testdata = new Map([
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy']
  ])

  it('base64str2ab of empty string is 0 bytes long', () => {
    let ab = base64str2ab('')
    expect(ab.byteLength).toBe(0)
  })

  it('base64 conversion of some test values to check out', () => {
    function expect_roundtrip (plaintext) {
      let ab = str2ab(plaintext)
      let str = ab2base64str(ab)
      expect(str).toBeDefined()
      let cycled = base64str2ab(str)
      expect(cycled).toBeDefined()
      expect(
        Array.from(new Uint8Array(cycled))).toEqual(
        Array.from(new Uint8Array(ab)))
    }

    expect_roundtrip('')
    expect_roundtrip('ABC')
    expect_roundtrip('A\u{1F4A9}C')
    for (let str of testdata.keys()) {
      expect_roundtrip(str)
    }
  })

  // https://tools.ietf.org/html/rfc4648#page-12
  it('should encode some well known values from RFC 4648', () => {
    for (let [key, value] of testdata) {
      let strBase64 = ab2base64str(ascii2ab(key))
      expect(strBase64).toEqual(value)
    }
  })
  it('should encode some well known values from RFC 4648', () => {
    function expect_ab2base64str (arr, expected) {
      let v = new Uint8Array(arr.length)
      let i = 0
      for (let b of arr) {
        v[i++] = b
      }
      let str = ab2base64str(v)
      expect(str).toEqual(expected)
    }

    expect_ab2base64str('foob'.split('').map(c => c.charCodeAt(0)), 'Zm9vYg==')
    expect(ab2base64str(ascii2ab('foob'))).toEqual('Zm9vYg==')
  })
})

function arr2byteArray (arr) {
  let v = new Uint8Array(arr.length)
  let i = 0
  for (let b of arr) {
    v[i++] = b
  }
  return v
}

function byteArray2arr (ba) {
  return Array.from(new Uint8Array(ba))
}

describe('Check ab_utils base64url support', () => {
  it('base64urlstr2ab of empty string is 0 bytes long', () => {
    let ab = base64urlstr2ab('')
    expect(ab.byteLength).toBe(0)
  })

  it('base64url conversion of some test values to check out', () => {
    function expect_roundtrip (plaintext) {
      let ab = str2ab(plaintext)
      let str = ab2base64urlstr(ab)
      expect(str).toBeDefined()
      let cycled = base64urlstr2ab(str)
      expect(cycled).toBeDefined()
      expect(
        Array.from(new Uint8Array(cycled))).toEqual(
        Array.from(new Uint8Array(ab)))
    }

    expect_roundtrip('')
    expect_roundtrip('ABC')
    expect_roundtrip('A\u{1F4A9}C')
  })

  it('should encode some values', () => {
    function expect_ab2base64urlstr (arr, expected) {
      let v = arr2byteArray(arr)
      let str = ab2base64urlstr(v)
      expect(str).toEqual(expected)
      return str
    }

    expect_ab2base64urlstr('foob'.split('').map(c => c.charCodeAt(0)), 'Zm9vYg')
    expect(ab2base64urlstr(ascii2ab('foob'))).toEqual('Zm9vYg')
    let arr = 'C\xef\xe4'.split('').map(c => c.charCodeAt(0))
    let str = expect_ab2base64urlstr(arr, 'Q-_k')
    expect(byteArray2arr(base64urlstr2ab(str))).toEqual(arr)
  })
})

describe('Check ab_utils utf8 support', () => {
  it('str2utf8ab of empty string is 0 bytes long', () => {
    let ab = str2utf8ab('')
    expect(ab.byteLength).toBe(0)
  })

  it('str2utf8ab conversion of some test values to check out', () => {
    function expect_roundtrip (text) {
      let ab = str2utf8ab(text)
      expect(ab).toBeDefined()
      let cycled = abutf82str(ab)
      expect(cycled).toBeDefined()
      expect(cycled).toEqual(text)
    }

    expect_roundtrip('')
    expect_roundtrip('ABC')
    expect_roundtrip('A\u{1F4A9}C')
  })
})
