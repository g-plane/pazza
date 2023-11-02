import { expect, test } from 'vitest'
import { map, mapErr, optional, satisfy } from '../src'
import { ErrorKind } from '../src/error'
import { fail, pass } from './_'

test('map', () => {
  expect(map(pass(10), (num) => num + 1)('')).toEqual({
    ok: true,
    input: '',
    output: 11,
    context: {},
  })

  expect(map(fail<number>(), (num) => num + 1)('')).toEqual({
    ok: false,
    input: '',
    error: 'Fake parsing error.',
    context: {},
  })
})

test('mapErr', () => {
  expect(mapErr(pass(10), (err) => `Error: ${err}`)('')).toEqual({
    ok: true,
    input: '',
    output: 10,
    context: {},
  })

  expect(mapErr(fail<number>(), (err) => `Error: ${err}`)('')).toEqual({
    ok: false,
    input: '',
    error: 'Error: Fake parsing error.',
    context: {},
  })
})

test('optional', () => {
  expect(optional(pass('test'))('')).toEqual({
    ok: true,
    input: '',
    output: 'test',
    context: {},
  })

  expect(optional(fail())('')).toEqual({
    ok: true,
    input: '',
    output: null,
    context: {},
  })
})

test('satisfy', () => {
  expect(satisfy((item) => item === 'a')('ab')).toEqual({
    ok: true,
    input: 'b',
    output: 'a',
    context: {},
  })

  expect(satisfy((item) => item === 'a')('ba')).toEqual({
    ok: false,
    input: 'ba',
    error: ErrorKind.Satisfy,
    context: {},
  })

  expect(satisfy((item: number) => item === 13)(Uint8Array.of(13, 10))).toEqual(
    {
      ok: true,
      input: Uint8Array.of(10),
      output: 13,
      context: {},
    }
  )

  expect(satisfy((item: number) => item === 13)(Uint8Array.of(8))).toEqual({
    ok: false,
    input: Uint8Array.of(8),
    error: ErrorKind.Satisfy,
    context: {},
  })
})
