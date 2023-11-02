import { expect, test } from 'vitest'
import {
  ErrorKind,
  Result,
  position,
  prefix,
  spanned,
  string,
  withPositionCtx,
} from '../src'

function omitPositionContext(
  result: Result<string, unknown, unknown, Record<string | symbol, unknown>>,
) {
  const ctx = result.context
  result.context = Object.keys(ctx).reduce(
    (obj, key) => Object.assign(obj, { [key]: ctx[key] }),
    {}
  )

  return result
}

test('position', () => {
  expect(position()('')).toEqual({
    ok: false,
    input: '',
    error: ErrorKind.MissingPositionContext,
    context: undefined,
  })

  expect(omitPositionContext(withPositionCtx(position())('', {}))).toEqual({
    ok: true,
    input: '',
    output: {
      offset: 0,
      line: 1,
      column: 0,
    },
    context: {},
  })

  expect(
    omitPositionContext(
      withPositionCtx(prefix(string('abc'), position()))('abcd', {})
    )
  ).toEqual({
    ok: true,
    input: 'd',
    output: {
      offset: 3,
      line: 1,
      column: 3,
    },
    context: {},
  })

  expect(
    omitPositionContext(
      withPositionCtx(prefix(string('ab\r\nc'), position()))('ab\r\ncd', {})
    )
  ).toEqual({
    ok: true,
    input: 'd',
    output: {
      offset: 5,
      line: 2,
      column: 1,
    },
    context: {},
  })

  expect(
    omitPositionContext(
      withPositionCtx(prefix(string('ab\rc'), position()))('ab\rcd', {})
    )
  ).toEqual({
    ok: true,
    input: 'd',
    output: {
      offset: 4,
      line: 1,
      column: 4,
    },
    context: {},
  })
})

test('spanned', () => {
  expect(
    omitPositionContext(withPositionCtx(spanned(string('abc')))('abcd', {}))
  ).toEqual({
    ok: true,
    input: 'd',
    output: {
      value: 'abc',
      start: {
        offset: 0,
        line: 1,
        column: 0,
      },
      end: {
        offset: 3,
        line: 1,
        column: 3,
      },
    },
    context: {},
  })

  expect(
    omitPositionContext(withPositionCtx(spanned(string('ab\nc')))('ab\ncd', {}))
  ).toEqual({
    ok: true,
    input: 'd',
    output: {
      value: 'ab\nc',
      start: {
        offset: 0,
        line: 1,
        column: 0,
      },
      end: {
        offset: 4,
        line: 2,
        column: 1,
      },
    },
    context: {},
  })
})
