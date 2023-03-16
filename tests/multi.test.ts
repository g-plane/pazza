import { test, expect } from 'vitest'
import {
  many,
  many0,
  many1,
  manyUntil,
  sepBy,
  sepBy1,
  sepEndBy,
  sepEndBy1,
  digit,
  char,
  ErrorKind,
} from '../src'

test('many', () => {
  const parser = many(digit(), 2, 3)

  expect(parser('1a')).toEqual({
    ok: false,
    input: 'a',
    error: {
      kind: ErrorKind.Many,
      output: ['1'],
    },
    context: {},
  })

  expect(parser('12')).toEqual({
    ok: true,
    input: '',
    output: ['1', '2'],
    context: {},
  })

  expect(parser('123')).toEqual({
    ok: true,
    input: '',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('1234')).toEqual({
    ok: true,
    input: '4',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(many(digit(), 0, Infinity)('')).toEqual({
    ok: true,
    input: '',
    output: [],
    context: {},
  })

  expect(many(digit(), 0, Infinity)('1234')).toEqual({
    ok: true,
    input: '',
    output: ['1', '2', '3', '4'],
    context: {},
  })

  expect(many(digit(), 2, 2)('1')).toEqual({
    ok: false,
    input: '',
    error: {
      kind: ErrorKind.Many,
      output: ['1'],
    },
    context: {},
  })

  expect(many(digit(), 2, 2)('12')).toEqual({
    ok: true,
    input: '',
    output: ['1', '2'],
    context: {},
  })

  expect(many(digit(), 2, 2)('123')).toEqual({
    ok: true,
    input: '3',
    output: ['1', '2'],
    context: {},
  })

  expect(() => many(digit(), 3, 2)).toThrow(
    'Maximum value must be greater than minimum value.'
  )
})

test('many0', () => {
  const parser = many0(digit())

  expect(parser('123a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('a')).toEqual({
    ok: true,
    input: 'a',
    output: [],
    context: {},
  })
})

test('many1', () => {
  const parser = many1(digit())

  expect(parser('123a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('a')).toEqual(digit()('a'))
})

test('manyUntil', () => {
  const parser = manyUntil(digit(), char('.'))

  expect(parser('.')).toEqual({
    ok: true,
    input: '.',
    output: [],
    context: {},
  })

  expect(parser('123.abc')).toEqual({
    ok: true,
    input: '.abc',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('123abc.abc')).toEqual({
    ok: false,
    input: 'abc.abc',
    error: ErrorKind.Digit,
    context: {},
  })
})

test('sepBy', () => {
  expect(sepBy(char(','), digit())('a')).toEqual({
    ok: true,
    input: 'a',
    output: [],
    context: {},
  })

  expect(sepBy(char(','), digit())('1a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(sepBy(char(','), digit())('1,a')).toEqual({
    ok: true,
    input: ',a',
    output: ['1'],
    context: {},
  })

  expect(sepBy(char(','), digit())('1,2a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepBy(char(','), digit(), 2)('1,2a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepBy(char(','), digit(), 2)('1,2,3a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(sepBy(char(','), digit(), 2)('1a')).toEqual({
    ok: false,
    input: 'a',
    error: {
      kind: ErrorKind.SepBy,
      output: ['1'],
    },
    context: {},
  })

  expect(sepBy(char(','), digit(), 2)('1,a')).toEqual({
    ok: false,
    input: ',a',
    error: {
      kind: ErrorKind.SepBy,
      output: ['1'],
    },
    context: {},
  })

  expect(sepBy(char(','), digit(), 1, 2)('1,2a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepBy(char(','), digit(), 1, 2)('1,2,3a')).toEqual({
    ok: true,
    input: ',3a',
    output: ['1', '2'],
    context: {},
  })

  expect(() => sepBy(char(','), digit(), 3, 2)).toThrow(
    'Maximum value must be greater than minimum value.'
  )
})

test('sepBy1', () => {
  const parser = sepBy1(char(','), digit())

  expect(parser('1a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(parser('1,a')).toEqual({
    ok: true,
    input: ',a',
    output: ['1'],
    context: {},
  })

  expect(parser('1,2,3a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.Digit,
    context: {},
  })
})

test('sepEndBy', () => {
  expect(sepEndBy(char(','), digit())('a')).toEqual({
    ok: true,
    input: 'a',
    output: [],
    context: {},
  })

  expect(sepEndBy(char(','), digit())(',a')).toEqual({
    ok: true,
    input: ',a',
    output: [],
    context: {},
  })

  expect(sepEndBy(char(','), digit())('1a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(sepEndBy(char(','), digit())('1,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(sepEndBy(char(','), digit())('1,2a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1,2a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1,2,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1,2,3a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1,2,3,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1a')).toEqual({
    ok: false,
    input: 'a',
    error: {
      kind: ErrorKind.SepEndBy,
      output: ['1'],
    },
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 2)('1,a')).toEqual({
    ok: false,
    input: 'a',
    error: {
      kind: ErrorKind.SepEndBy,
      output: ['1'],
    },
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 1, 2)('1,2,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2'],
    context: {},
  })

  expect(sepEndBy(char(','), digit(), 1, 2)('1,2,3a')).toEqual({
    ok: true,
    input: '3a',
    output: ['1', '2'],
    context: {},
  })

  expect(() => sepEndBy(char(','), digit(), 3, 2)).toThrow(
    'Maximum value must be greater than minimum value.'
  )
})

test('sepEndBy1', () => {
  const parser = sepEndBy1(char(','), digit())

  expect(parser('1a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(parser('1,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1'],
    context: {},
  })

  expect(parser('1,2,3a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('1,2,3,a')).toEqual({
    ok: true,
    input: 'a',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.Digit,
    context: {},
  })

  expect(parser(',a')).toEqual({
    ok: false,
    input: ',a',
    error: ErrorKind.Digit,
    context: {},
  })
})
