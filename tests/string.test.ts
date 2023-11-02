import { expect, test } from 'vitest'
import { ErrorKind, digit, string, string0, string1 } from '../src'

test('string', () => {
  expect(string('str')('string')).toEqual({
    ok: true,
    input: 'ing',
    output: 'str',
    context: {},
  })

  expect(string('str')('')).toEqual({
    ok: false,
    input: '',
    error: ErrorKind.String,
    context: {},
  })
})

test('string0', () => {
  const parser = string0(digit())

  expect(parser('123abc')).toEqual({
    ok: true,
    input: 'abc',
    output: '123',
    context: {},
  })

  expect(parser('a')).toEqual({
    ok: true,
    input: 'a',
    output: '',
    context: {},
  })

  expect(parser('')).toEqual({
    ok: true,
    input: '',
    output: '',
    context: {},
  })
})

test('string1', () => {
  const parser = string1(digit())

  expect(parser('123abc')).toEqual({
    ok: true,
    input: 'abc',
    output: '123',
    context: {},
  })

  expect(parser('a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.Digit,
    context: {},
  })

  expect(parser('')).toEqual({
    ok: false,
    input: '',
    error: ErrorKind.Digit,
    context: {},
  })
})
