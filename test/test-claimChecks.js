/* eslint-env jasmine */

import * as cc from '../src/claimChecks'
import * as testData from './test-data'
import {omit} from './tlib'
import MockDate from 'mockdate'

describe('Check JWT claim checking', () => {
  describe('checkNumberClaims', () => {
    it('Should throw if the claim is of type string', () => {
      function test () {
        cc.checkNumberClaims({foo: 'hello', bar: '123'}, ['foo'])
      }
      expect(test).toThrowError(/foo.*number/)
    })
    it('Should throw if the claim is of type string although it contains a number', () => {
      function test () {
        cc.checkNumberClaims({foo: 'hello', bar: '123'}, ['bar'])
      }
      expect(test).toThrowError(/bar.*number.*string/)
    })
    it('Should throw if the claim is of type object', () => {
      function test () {
        cc.checkNumberClaims({foo: 'hello', bar: {hi: 123}}, ['bar'])
      }
      expect(test).toThrowError(/bar.*number.*object.*hi/)
    })
    it('Should throw if the claim is of type array', () => {
      function test () {
        cc.checkNumberClaims({foo: 'hello', bar: [123]}, ['bar'])
      }
      expect(test).toThrowError(/bar.*number.*array/)
    })
    it('Should accept multiple numbers', () => {
      let [foo, bar] = cc.checkNumberClaims({foo: 123, bar: 456}, ['foo', 'bar'])
      expect(foo).toEqual(123)
      expect(bar).toEqual(456)
    })
    it('Should not accept some numbers', () => {
      function test () {
        cc.checkNumberClaims({
          foo: 123,
          bar: 'hi 456'
        }, ['foo', 'bar'])
      }
      expect(test).toThrowError(/bar.*number.*string.*hi 456/)
    })
  })
  describe('checkStringClaims', () => {
    it('Should throw if the claim is of type number', () => {
      function test () {
        cc.checkStringClaims({foo: 123, bar: '123'}, ['foo'])
      }
      expect(test).toThrowError(/foo.*string.*number.*123/)
    })
    it('Should throw if the claim is of type object', () => {
      function test () {
        cc.checkStringClaims({foo: 'hello', bar: {hi: 123}}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*object.*hi/)
    })
    it('Should throw if the claim is of type array', () => {
      function test () {
        cc.checkStringClaims({foo: 'hello', bar: [123]}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*array.*\[123]/)
    })
    it('Should accept multiple strings', () => {
      let [foo, bar] = cc.checkStringClaims({foo: 'hey', bar: 'ho', car: 'lets go'}, ['foo', 'bar'])
      expect(foo).toEqual('hey')
      expect(bar).toEqual('ho')
    })
    it('Should not accept some strings', () => {
      function test () {
        cc.checkStringClaims({
          foo: 123,
          bar: 'hi 456'
        }, ['foo', 'bar'])
      }
      expect(test).toThrowError(/foo.*string.*number.*123/)
    })
  })
  describe('checkStringOrStringArrayClaims', () => {
    it('Should throw if the claim is of type number', () => {
      function test () {
        cc.checkStringOrStringArrayClaims({foo: 123, bar: '123'}, ['foo'])
      }
      expect(test).toThrowError(/foo.*string.*number.*123/)
    })
    it('Should throw if the claim is of type object', () => {
      function test () {
        cc.checkStringOrStringArrayClaims({foo: 'hello', bar: {hi: 123}}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*object/)
    })
    it('Should throw if the claim is of type array with non string elements', () => {
      function test () {
        cc.checkStringOrStringArrayClaims({foo: 'hello', bar: [123]}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*\[123]/)
    })
    it('Should accept multiple single strings', () => {
      let [foo, bar] = cc.checkStringOrStringArrayClaims({foo: 'hey', bar: 'ho', car: 'lets go'}, ['foo', 'bar'])
      expect(foo).toEqual(['hey'])
      expect(bar).toEqual(['ho'])
    })
    it('Should accept multiple single and arrays of strings', () => {
      let [foo, bar] = cc.checkStringOrStringArrayClaims({foo: ['hey', 'ho'], car: 'lets go'}, ['foo', 'car'])
      expect(foo).toEqual(['hey', 'ho'])
      expect(bar).toEqual(['lets go'])
    })
    it('Should not accept some strings', () => {
      function test () {
        cc.checkStringOrStringArrayClaims({
          foo: 123,
          bar: 'hi 456'
        }, ['foo', 'bar'])
      }
      expect(test).toThrowError(/foo.*string.*number.*123/)
    })
  })
  describe('checkStringArrayClaims', () => {
    it('Should throw if the claim is of type number', () => {
      function test () {
        cc.checkStringArrayClaims({foo: 123, bar: '123'}, ['foo'])
      }
      expect(test).toThrowError(/foo.*string.*number.*123/)
    })
    it('Should throw if the claim is of type object', () => {
      function test () {
        cc.checkStringArrayClaims({foo: 'hello', bar: {hi: 123}}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*object/)
    })
    it('Should throw if the claim is of type array with non string elements', () => {
      function test () {
        cc.checkStringArrayClaims({foo: 'hello', bar: [123]}, ['bar'])
      }
      expect(test).toThrowError(/bar.*string.*\[123]/)
    })
    it('Should accept arrays of strings', () => {
      let [foo, bar] = cc.checkStringArrayClaims({foo: ['hey', 'ho'], car: ['lets go']}, ['foo', 'car'])
      expect(foo).toEqual(['hey', 'ho'])
      expect(bar).toEqual(['lets go'])
    })
  })
  describe('check_aud_azp', () => {
    it('Should throw if azp claim is of type number', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary'], azp: 123}, 123)
      }
      expect(test).toThrowError(/azp.*string.*not.*number.*123/)
    })
    it('Should throw if azp claim does not match client id', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary'], azp: 'zoe'}, 'bertie')
      }
      expect(test).toThrowError(/azp.*zoe.*not.*match.*bertie/)
    })
    it('Should throw if none of multiple aud values matches client also', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary'], azp: 'zoe'}, 'zoe')
      }
      expect(test).toThrowError(/aud.*joe.*mary.*not.*zoe/)
    })
    it('Should accept azp claim and multiple aud values matching client id', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary', 'zoe'], azp: 'zoe'}, 'zoe')
      }
      expect(test).not.toThrow()
    })
    it('Should accept azp claim and single aud value array not matching the client id', () => {
      function test () {
        cc.check_aud_azp({aud: ['mary'], azp: 'zoe'}, 'zoe')
      }
      expect(test).not.toThrow()
    })
    it('Should accept azp claim and single aud value not matching the client id', () => {
      function test () {
        cc.check_aud_azp({aud: 'mary', azp: 'zoe'}, 'zoe')
      }
      expect(test).not.toThrow()
    })
    it('Should throw if none of multiple aud values matches client', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary']}, 'zoe')
      }
      expect(test).toThrowError(/aud.*joe.*mary.*not.*zoe/)
    })
    it('Should accept if one of multiple aud values matches client', () => {
      function test () {
        cc.check_aud_azp({aud: ['joe', 'mary', 'zoe']}, 'zoe')
      }
      expect(test).not.toThrow()
    })
  })
  describe('checkAccessClaims', () => {
    const expectedClaims = ['jti', 'iss', 'sub', 'aud', 'exp', 'iat']
    // todo: should scope be expected?
    beforeEach(() => {
      MockDate.set((testData.real_data.access_claims.iat + 1000) * 1000)
    })
    afterEach(() => {
      MockDate.reset()
    })
    it('Should not throw with valid access token', () => {
      function test () {
        cc.checkAccessClaims(testData.real_data.access_claims, {
          issuer: testData.real_data.access_claims.iss,
          client_id: testData.real_data.access_claims.aud
        })
      }
      expect(test).not.toThrow()
    })
    it('Should throw when any expected claim is missing', () => {
      function test (claim) {
        cc.checkAccessClaims(omit(testData.real_data.access_claims, claim), {
          issuer: testData.real_data.access_claims.iss,
          client_id: testData.real_data.access_claims.aud
        })
      }
      for (let c of expectedClaims) {
        const search = `must have ${c} claim`
        expect(test.bind(null, c)).toThrowError(new RegExp(search))
      }
    })
    it('Should throw when any expected claim is undefined', () => {
      function test (claim) {
        let claims = Object.assign({}, testData.real_data.access_claims)
        claims[claim] = undefined
        cc.checkAccessClaims(claims, {
          issuer: testData.real_data.access_claims.iss,
          client_id: testData.real_data.access_claims.aud
        })
      }
      for (let c of expectedClaims) {
        const search = `must have ${c} claim`
        expect(test.bind(null, c)).toThrowError(new RegExp(search))
      }
    })
    it('Should throw when any expected claim is empty string', () => {
      function test (claim) {
        let claims = Object.assign({}, testData.real_data.access_claims)
        claims[claim] = ''
        cc.checkAccessClaims(claims, {
          issuer: testData.real_data.access_claims.iss,
          client_id: testData.real_data.access_claims.aud
        })
      }
      for (let c of expectedClaims) {
        expect(test.bind(null, c)).toThrow()
      }
    })
  })
  describe('checkIdClaims', () => {
    const expectedClaims = ['iss', 'sub', 'aud', 'exp', 'iat', 'nonce', 'at_hash', 'amr']

    beforeEach(() => {
      MockDate.set((testData.real_data.id_claims.iat + 1000) * 1000)
    })
    afterEach(() => {
      MockDate.reset()
    })
    it('Should not throw with valid id token', () => {
      function test () {
        cc.checkIdClaims(testData.real_data.id_claims, {
          issuer: testData.real_data.id_claims.iss,
          client_id: testData.real_data.id_claims.aud
        })
      }
      expect(test).not.toThrow()
    })
    it('Should throw when any expected claim is missing', () => {
      function test (claim) {
        cc.checkIdClaims(omit(testData.real_data.id_claims, claim), {
          issuer: testData.real_data.id_claims.iss,
          client_id: testData.real_data.id_claims.aud
        })
      }
      for (let c of expectedClaims) {
        const search = `must have ${c} claim`
        expect(test.bind(null, c)).toThrowError(new RegExp(search))
      }
    })
    it('Should throw when any expected claim is undefined', () => {
      function test (claim) {
        let claims = Object.assign({}, testData.real_data.id_claims)
        claims[claim] = undefined
        cc.checkIdClaims(claims, {
          issuer: testData.real_data.id_claims.iss,
          client_id: testData.real_data.id_claims.aud
        })
      }
      for (let c of expectedClaims) {
        const search = `must have ${c} claim`
        expect(test.bind(null, c)).toThrowError(new RegExp(search))
      }
    })
    it('Should throw when any expected claim is empty string', () => {
      function test (claim) {
        let claims = Object.assign({}, testData.real_data.id_claims)
        claims[claim] = ''
        cc.checkIdClaims(claims, {
          issuer: testData.real_data.id_claims.iss,
          client_id: testData.real_data.id_claims.aud
        })
      }
      for (let c of expectedClaims) {
        expect(test.bind(null, c)).toThrow()
      }
    })
    it('Should throw when amr claim is an empty array', () => {
      function test (claim) {
        let claims = Object.assign({}, testData.real_data.id_claims)
        claims[claim] = []
        cc.checkIdClaims(claims, {
          issuer: testData.real_data.id_claims.iss,
          client_id: testData.real_data.id_claims.aud
        })
      }
      expect(test.bind(null, 'amr')).toThrow()
    })
  })
})
