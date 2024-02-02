import { expect, test } from 'vitest'
import { ErrorKind, IParser, Input, digit, map } from '../src'

test('context', () => {
  const myContext = { key: 'value' }

  expect(digit()('5', myContext)).toEqual({
    ok: true,
    input: '',
    output: '5',
    context: myContext,
  })

  expect(digit()('', myContext)).toEqual({
    ok: false,
    input: '',
    error: ErrorKind.Digit,
    context: myContext,
  })

  type State = { state: number }
  function requireState<O, E, I extends Input>(
    parser: IParser<O, E, I>,
  ): IParser<O, E, I, State> {
    return <C extends State>(input: I, context: C = Object.create(null)) => parser(input, context)
  }
  function injectState<O, E, I extends Input>(
    parser: IParser<O, E, I>,
  ): IParser<O, E, I, unknown, State> {
    return <C extends object>(input: I, context: C = Object.create(null)) =>
      parser(input, Object.assign(context, {} as State))
  }

  requireState(
    digit()
    // @ts-expect-error
  )('', {})

  const result1 = injectState(requireState(digit()))('', { extra: '' })
  expect(result1.context).toEqual({ extra: '' })

  const parser2 = map(requireState(digit()), () => 0)
  // @ts-expect-error
  parser2('', {})

  const result2 = injectState(parser2)('', { extra: '' })
  expect(result2.context).toEqual({ extra: '' })
})
