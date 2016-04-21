import bows from 'bows'

var log = bows('Anvil.validate')

/* eslint-env jasmine */
describe('This es6 code should pass', () => {
  it('expect 2 = 1+1 ', () => {
    let sum = 2
    expect(sum).toBe(1 + 1)
    log.debug('mini.js test executed')
  })
})
