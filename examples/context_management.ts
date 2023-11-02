import { produce } from 'immer'
import createStore, { type Store } from 'unistore'
import { ErrorKind, IParser, between, char, digit, sepBy } from '../src'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type Context = Record<Digit, number>

export const parserContext: Context = {
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

function parseDigitArray(
  digitParser: () => IParser<Digit, ErrorKind.Digit, string, Context>,
) {
  return between(char('['), char(']'), sepBy(char(','), digitParser()))
}

// #region using Immer
function parseDigitWithImmer(): IParser<
  Digit,
  ErrorKind.Digit,
  string,
  Context
> {
  return (input: string, context: Context = parserContext) => {
    const result = digit()(input, context)
    if (!result.ok) {
      return result
    }

    // We use Immer here to create an immutable parser context.
    context = produce(result.context, (draft) => {
      draft[result.output] += 1
    })

    return { ...result, context }
  }
}

export function contextedParserWithImmer() {
  return parseDigitArray(parseDigitWithImmer)
}
// #endregion

// #region using unistore

// unistore is a state management library which similar to Redux
// but more easy to use and simpler.

function parseDigitWithUnistore(): IParser<
  Digit,
  ErrorKind.Digit,
  string,
  Store<Context>
> {
  return (
    input: string,
    context: Store<Context> = createStore(parserContext),
  ) => {
    const result = digit()(input, context)
    if (!result.ok) {
      return result
    }

    const key = result.output
    context!.action((state) => ({ [key]: state[key] + 1 }))()

    return { ...result, context }
  }
}

export function contextedParserWithUnistore() {
  return parseDigitArray(parseDigitWithUnistore)
}

export function createUnistoreContext() {
  return createStore(parserContext)
}
// #endregion
