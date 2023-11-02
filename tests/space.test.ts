import { expect, test } from 'vitest'
import {
  ErrorKind,
  alpha,
  cr,
  crlf,
  eof,
  lf,
  linebreak,
  space,
  tab,
  trim,
  whitespace,
} from '../src'

test('space', () => {
  expect(space()('  ')).toEqual({
    ok: true,
    input: ' ',
    output: ' ',
    context: {},
  })

  expect(space()('\n')).toEqual({
    ok: false,
    input: '\n',
    error: ErrorKind.Space,
    context: {},
  })
})

test('cr', () => {
  expect(cr()('\rabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\r',
    context: {},
  })

  expect(cr()('\nabc')).toEqual({
    ok: false,
    input: '\nabc',
    error: ErrorKind.CarriageReturn,
    context: {},
  })
})

test('lf', () => {
  expect(lf()('\nabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\n',
    context: {},
  })

  expect(lf()('\rabc')).toEqual({
    ok: false,
    input: '\rabc',
    error: ErrorKind.LineFeed,
    context: {},
  })
})

test('crlf', () => {
  expect(crlf()('\r\nabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\r\n',
    context: {},
  })

  expect(crlf()('\nabc')).toEqual({
    ok: false,
    input: '\nabc',
    error: ErrorKind.CarriageReturnLineFeed,
    context: {},
  })
})

test('linebreak', () => {
  expect(linebreak()('\r\nabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\r\n',
    context: {},
  })

  expect(linebreak()('\nabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\n',
    context: {},
  })

  expect(linebreak()('\rabc')).toEqual({
    ok: false,
    input: '\rabc',
    error: ErrorKind.Linebreak,
    context: {},
  })
})

test('tab', () => {
  expect(tab()('\tabc')).toEqual({
    ok: true,
    input: 'abc',
    output: '\t',
    context: {},
  })

  expect(tab()(' abc')).toEqual({
    ok: false,
    input: ' abc',
    error: ErrorKind.Tab,
    context: {},
  })
})

test('whitespace', () => {
  const unicodeWhitespace = [
    '\u0009',
    '\u000A',
    '\u000B',
    '\u000C',
    '\u000D',
    '\u0020',
    '\u0085',
    '\u00A0',
    '\u1680',
    '\u2000',
    '\u2001',
    '\u2002',
    '\u2003',
    '\u2004',
    '\u2005',
    '\u2006',
    '\u2007',
    '\u2008',
    '\u2009',
    '\u200A',
    '\u2028',
    '\u2029',
    '\u202F',
    '\u205F',
    '\u3000',
  ]

  unicodeWhitespace.forEach((char) => {
    expect(whitespace()(char)).toEqual({
      ok: true,
      input: '',
      output: char,
      context: {},
    })
  })

  expect(whitespace()('\uFEFF')).toEqual({
    ok: false,
    input: '\uFEFF',
    error: ErrorKind.Whitespace,
    context: {},
  })
})

test('trim', () => {
  const result = trim(alpha())('  \n  \t  \r  \f  abc')
  expect(result).toEqual({
    ok: true,
    input: 'bc',
    output: 'a',
    context: {},
  })
})

test('eof', () => {
  expect(eof()('')).toEqual({
    ok: true,
    input: '',
    output: undefined,
    context: {},
  })

  expect(eof()('t')).toEqual({
    ok: false,
    input: 't',
    error: ErrorKind.EndOfFile,
    context: {},
  })

  expect(eof()(Uint8Array.of())).toEqual({
    ok: true,
    input: Uint8Array.of(),
    output: undefined,
    context: {},
  })

  expect(eof()(Uint8Array.of(65))).toEqual({
    ok: false,
    input: Uint8Array.of(65),
    error: ErrorKind.EndOfFile,
    context: {},
  })
})
