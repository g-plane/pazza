import { expect, test } from 'vitest'
import {
  ErrorKind,
  alpha,
  anyChar,
  char,
  digit,
  escapedBy,
  escapedWith,
  hex,
  lower,
  noneOfChars,
  octal,
  oneOfChars,
  upper,
} from '../src'

test('char', () => {
  expect(() => char('')).toThrow(
    'Argument of character parser must be a single character.'
  )

  expect(() => char('ab')).toThrow(
    'Argument of character parser must be a single character.'
  )

  expect(char('a')('ab')).toEqual({
    ok: true,
    input: 'b',
    output: 'a',
    context: {},
  })

  expect(char('a')('b')).toEqual({
    ok: false,
    input: 'b',
    error: ErrorKind.Char,
    context: {},
  })
})

test('anyChar', () => {
  expect(anyChar()('test')).toEqual({
    ok: true,
    input: 'est',
    output: 't',
    context: {},
  })

  expect(anyChar()('')).toEqual({
    ok: false,
    input: '',
    error: ErrorKind.AnyChar,
    context: {},
  })
})

test('oneOfChars', () => {
  expect(() => oneOfChars('', 'a')).toThrow(
    'Argument of character parser must be a single character.'
  )

  expect(() => oneOfChars('a', 'bc')).toThrow(
    'Argument of character parser must be a single character.'
  )

  const chars = ['a', 'b', 'c']
  const parser = oneOfChars(...chars)

  chars.forEach((char) => {
    expect(parser(`${char}-`)).toEqual({
      ok: true,
      input: '-',
      output: char,
      context: {},
    })
  })

  expect(parser('d')).toEqual({
    ok: false,
    input: 'd',
    error: ErrorKind.OneOfChars,
    context: {},
  })
})

test('noneOfChars', () => {
  expect(() => noneOfChars('', 'a')).toThrow(
    'Argument of character parser must be a single character.'
  )

  expect(() => noneOfChars('a', 'bc')).toThrow(
    'Argument of character parser must be a single character.'
  )

  const chars = ['a', 'b', 'c']
  const parser = noneOfChars(...chars)

  chars.forEach((char) => {
    expect(parser(char)).toEqual({
      ok: false,
      input: char,
      error: ErrorKind.NoneOfChars,
      context: {},
    })
  })

  expect(parser('d')).toEqual({
    ok: true,
    input: '',
    output: 'd',
    context: {},
  })
})

test('escapedWith', () => {
  expect(() =>
    escapedWith('', [
      ['a', ''],
      ['b', ''],
    ])
  ).toThrow('Argument of character parser must be a single character.')

  expect(() =>
    escapedWith('ab', [
      ['a', ''],
      ['b', ''],
    ])
  ).toThrow('Argument of character parser must be a single character.')

  expect(() =>
    escapedWith('a', [
      ['ab', ''],
      ['c', ''],
    ])
  ).toThrow('Argument of character parser must be a single character.')

  expect(() =>
    escapedWith('a', [
      ['', ''],
      ['ab', ''],
    ])
  ).toThrow('Argument of character parser must be a single character.')

  const chars = [
    ['n', '\n'],
    ['\\', '\\'],
  ] as const
  const parser = escapedWith('\\', chars)

  chars.forEach(([char, raw]) => {
    expect(parser(`\\${char}`)).toEqual({
      ok: true,
      input: '',
      output: raw,
      context: {},
    })
  })

  expect(parser('\\t')).toEqual({
    ok: false,
    input: '\\t',
    error: ErrorKind.EscapedWith,
    context: {},
  })
})

test('escapedBy', () => {
  expect(() => escapedBy('', (_) => true)).toThrow(
    'Argument of character parser must be a single character.'
  )

  expect(() => escapedBy('ab', (_) => true)).toThrow(
    'Argument of character parser must be a single character.'
  )

  const parser1 = escapedBy('\\', (char) => {
    if (char === 'n') {
      return 10
    } else {
      return null
    }
  })
  expect(parser1('\\n')).toEqual({
    ok: true,
    input: '',
    output: 10,
    context: {},
  })
  expect(parser1('\\t')).toEqual({
    ok: false,
    input: '\\t',
    error: ErrorKind.EscapedBy,
    context: {},
  })
  expect(parser1('\\')).toEqual({
    ok: false,
    input: '\\',
    error: ErrorKind.EscapedBy,
    context: {},
  })

  const parser2 = escapedBy('\\', (char) => {
    if (char === 'n') {
      return 10
    }
  })
  expect(parser2('\\n')).toEqual({
    ok: true,
    input: '',
    output: 10,
    context: {},
  })
  expect(parser2('\\t')).toEqual({
    ok: false,
    input: '\\t',
    error: ErrorKind.EscapedBy,
    context: {},
  })
  expect(parser2('\\')).toEqual({
    ok: false,
    input: '\\',
    error: ErrorKind.EscapedBy,
    context: {},
  })
})

test('octal', () => {
  for (let i = 0; i <= 7; i += 1) {
    const num = i.toString()
    expect(octal()(num)).toEqual({
      ok: true,
      input: '',
      output: num,
      context: {},
    })
  }

  expect(octal()('8')).toEqual({
    ok: false,
    input: '8',
    error: ErrorKind.Octal,
    context: {},
  })
})

test('digit', () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString()
    expect(digit()(num)).toEqual({
      ok: true,
      input: '',
      output: num,
      context: {},
    })
  }

  expect(digit()('a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.Digit,
    context: {},
  })
})

test('hex', () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString()
    expect(hex()(num)).toEqual({
      ok: true,
      input: '',
      output: num,
      context: {},
    })
  }

  const lower = ['a', 'b', 'c', 'd', 'e', 'f']
  const upper = lower.map((c) => c.toUpperCase())

  lower.forEach((c) => {
    expect(hex()(c)).toEqual({
      ok: true,
      input: '',
      output: c,
      context: {},
    })
  })

  upper.forEach((c) => {
    expect(hex()(c)).toEqual({
      ok: true,
      input: '',
      output: c,
      context: {},
    })
  })

  lower.forEach((c) => {
    expect(hex('lower')(c)).toEqual({
      ok: true,
      input: '',
      output: c,
      context: {},
    })
  })

  upper.forEach((c) => {
    expect(hex('lower')(c)).toEqual({
      ok: false,
      input: c,
      error: ErrorKind.LowerHex,
      context: {},
    })
  })

  lower.forEach((c) => {
    expect(hex('upper')(c)).toEqual({
      ok: false,
      input: c,
      error: ErrorKind.UpperHex,
      context: {},
    })
  })

  upper.forEach((c) => {
    expect(hex('upper')(c)).toEqual({
      ok: true,
      input: '',
      output: c,
      context: {},
    })
  })

  expect(hex()('h')).toEqual({
    ok: false,
    input: 'h',
    error: ErrorKind.Hex,
    context: {},
  })

  expect(hex('upper')('h')).toEqual({
    ok: false,
    input: 'h',
    error: ErrorKind.Hex,
    context: {},
  })

  expect(hex('lower')('h')).toEqual({
    ok: false,
    input: 'h',
    error: ErrorKind.Hex,
    context: {},
  })
})

test('alpha', () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i)
    expect(alpha()(char)).toEqual({
      ok: true,
      input: '',
      output: char,
      context: {},
    })
  }

  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i)
    expect(alpha()(char)).toEqual({
      ok: true,
      input: '',
      output: char,
      context: {},
    })
  }

  expect(alpha()('5')).toEqual({
    ok: false,
    input: '5',
    error: ErrorKind.Alphabet,
    context: {},
  })
})

test('lower', () => {
  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i)
    expect(lower()(char)).toEqual({
      ok: true,
      input: '',
      output: char,
      context: {},
    })
  }

  expect(lower()('A')).toEqual({
    ok: false,
    input: 'A',
    error: ErrorKind.LowerAlphabet,
    context: {},
  })
})

test('upper', () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i)
    expect(upper()(char)).toEqual({
      ok: true,
      input: '',
      output: char,
      context: {},
    })
  }

  expect(upper()('a')).toEqual({
    ok: false,
    input: 'a',
    error: ErrorKind.UpperAlphabet,
    context: {},
  })
})
