import { expect, test } from 'vitest'
import { jsonValue } from './json'

test('jsonParser', () => {
  const result = jsonValue()(`
    [
      2,
      -43.21,
      true,
      "test",
      "\\n\\"\\t",
      false,
      {
        "a": "b",
        "c": null
      }
    ]
  `)

  expect(result).toEqual({
    ok: true,
    input: '\n  ',
    output: [
      2,
      -43.21,
      true,
      'test',
      '\n"\t',
      false,
      {
        a: 'b',
        c: null,
      },
    ],
    context: {},
  })
})
