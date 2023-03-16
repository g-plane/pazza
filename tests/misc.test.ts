import { test, expect } from 'vitest'
import { pass } from './_'
import { lazy } from '../src'

test('lazy', () => {
  const parser = lazy(() => pass('kumiko'))

  expect(parser('')).toEqual({
    ok: true,
    input: '',
    output: 'kumiko',
    context: {},
  })
})
