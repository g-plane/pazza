import { expect, test } from 'vitest'
import { lazy } from '../src'
import { pass } from './_'

test('lazy', () => {
  const parser = lazy(() => pass('kumiko'))

  expect(parser('')).toEqual({
    ok: true,
    input: '',
    output: 'kumiko',
    context: {},
  })
})
