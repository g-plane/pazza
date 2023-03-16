import { test, expect } from 'vitest'
import {
  Context,
  contextedParserWithImmer,
  contextedParserWithUnistore,
  parserContext,
  createUnistoreContext,
} from './context_management'

const text = '[1,2,2,4,6,3,6,3,9,3,2,3,7,5,3]'

test('contextManagement', () => {
  const context: Context = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
  }

  const result1 = contextedParserWithImmer()(text, parserContext)
  expect(result1.context).not.toStrictEqual(context)
  expect(result1).toEqual({
    ok: true,
    input: '',
    output: [
      '1',
      '2',
      '2',
      '4',
      '6',
      '3',
      '6',
      '3',
      '9',
      '3',
      '2',
      '3',
      '7',
      '5',
      '3',
    ],
    context: {
      '0': 0,
      '1': 1,
      '2': 3,
      '3': 5,
      '4': 1,
      '5': 1,
      '6': 2,
      '7': 1,
      '8': 0,
      '9': 1,
    },
  })

  const result2 = contextedParserWithUnistore()(text, createUnistoreContext())
  expect(result2.context.getState()).not.toStrictEqual(context)
  expect({ ...result2, context: result2.context.getState() }).toEqual({
    ok: true,
    input: '',
    output: [
      '1',
      '2',
      '2',
      '4',
      '6',
      '3',
      '6',
      '3',
      '9',
      '3',
      '2',
      '3',
      '7',
      '5',
      '3',
    ],
    context: {
      '0': 0,
      '1': 1,
      '2': 3,
      '3': 5,
      '4': 1,
      '5': 1,
      '6': 2,
      '7': 1,
      '8': 0,
      '9': 1,
    },
  })
})
