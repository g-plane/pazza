import { test, expect } from 'vitest'
import {
  between,
  serial,
  prefix,
  suffix,
  char,
  digit,
  ErrorKind,
  IParser,
} from '../src'

test('between', () => {
  expect(between(char('['), char(']'), digit())('[5]')).toEqual(digit()('5'))

  expect(between(char('['), char(']'), digit())('5]')).toEqual(char('[')('5]'))

  expect(between(char('['), char(']'), digit())('[]')).toEqual(digit()(']'))

  expect(between(char('['), char(']'), digit())('[5')).toEqual(char(']')(''))
})

test('serial', () => {
  const parser = serial(char('1'), char('2'), char('3'))

  expect(parser('1234')).toEqual({
    ok: true,
    input: '4',
    output: ['1', '2', '3'],
    context: {},
  })

  expect(parser('124')).toEqual({
    ok: false,
    input: '4',
    error: ErrorKind.Char,
    context: {},
  })

  // context typing tests
  const parser1 = digit() as IParser<string, ErrorKind, string, { t1: string }>
  const parser2 = digit() as IParser<string, ErrorKind, string, { t2: number }>
  const parser3 = serial(parser1, parser2)
  // @ts-expect-error
  parser3('', { t1: '' })
  // @ts-expect-error
  parser3('', { t2: 0 })
  // @ts-expect-error
  parser3('', { t1: 0, t2: '' })
  const _: { t1: string; t2: number; t3: boolean } = parser3('', {
    t1: '',
    t2: 0,
    t3: true,
  }).context
})

test('prefix', () => {
  const parser = prefix(char('<'), digit())

  expect(parser('<5')).toEqual({
    ok: true,
    input: '',
    output: '5',
    context: {},
  })

  expect(parser('[5')).toEqual({
    ok: false,
    input: '[5',
    error: ErrorKind.Char,
    context: {},
  })

  expect(parser('<a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.Digit,
    context: {},
  })
})

test('suffix', () => {
  const parser = suffix(digit(), char('>'))

  expect(parser('5>')).toEqual({
    ok: true,
    input: '',
    output: '5',
    context: {},
  })

  expect(parser('5]')).toEqual({
    ok: false,
    input: ']',
    error: ErrorKind.Char,
    context: {},
  })

  expect(parser('a>')).toEqual({
    ok: false,
    input: 'a>',
    error: ErrorKind.Digit,
    context: {},
  })
})
