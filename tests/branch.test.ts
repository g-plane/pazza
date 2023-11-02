import { expect, test } from 'vitest'
import { ErrorKind, alpha, choice, digit, map, or } from '../src'
import { fail, pass } from './_'

test('or', () => {
  expect(or(pass(1), pass(2))('')).toEqual({
    ok: true,
    input: '',
    output: 1,
    context: {},
  })

  expect(or(pass(1), fail())('')).toEqual({
    ok: true,
    input: '',
    output: 1,
    context: {},
  })

  expect(or(fail(), pass(2))('')).toEqual({
    ok: true,
    input: '',
    output: 2,
    context: {},
  })

  expect(or(fail(), fail())('')).toEqual({
    ok: false,
    input: '',
    error: 'Fake parsing error.',
    context: {},
  })
})

test('choice', () => {
  const parser = choice(digit(), alpha())

  expect(parser('1a')).toEqual({
    ok: true,
    input: 'a',
    output: '1',
    context: {},
  })

  expect(parser('a1')).toEqual({
    ok: true,
    input: '1',
    output: 'a',
    context: {},
  })

  expect(parser('-1a')).toEqual({
    ok: false,
    input: '-1a',
    error: ErrorKind.Alphabet,
    context: {},
  })

  expect(choice(alpha(), map(digit(), Number.parseInt))('5')).toEqual({
    ok: true,
    input: '',
    output: 5,
    context: {},
  })
})
