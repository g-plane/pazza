import produce from "https://cdn.skypack.dev/immer?dts";
import createStore from "https://cdn.skypack.dev/unistore?dts";
import type { Store } from "https://cdn.skypack.dev/unistore?dts";
import {
  context,
  between,
  sepBy,
  digit,
  char,
  IParser,
  ErrorKind,
} from "../mod.ts";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Context = Record<Digit, number>;

const parserContext: Context = {
  "0": 0,
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0,
};

function parseDigitArray(
  digitParser: () => IParser<Digit, ErrorKind.Digit, string, Context>,
) {
  return between(char("["), char("]"), sepBy(char(","), digitParser()));
}

//#region using Immer
function parseDigitWithImmer(): IParser<
  Digit,
  ErrorKind.Digit,
  string,
  Context
> {
  return {
    parse(input, context) {
      const result = digit().parse(input, context);
      if (!result.ok) {
        return result;
      }

      // We use Immer here to create an immutable parser context.
      context = produce(result.context!, (draft) => {
        draft[result.output] += 1;
      });

      return { ...result, context };
    },
  };
}

export function contextedParserWithImmer(ctx = parserContext) {
  return context(ctx, parseDigitArray(parseDigitWithImmer));
}
//#endregion

//#region using unistore

// unistore is a state management library which similar to Redux
// but more easy to use and simpler.

function parseDigitWithUnistore(): IParser<
  Digit,
  ErrorKind.Digit,
  string,
  Store<Context>
> {
  return {
    parse(input, context) {
      const result = digit().parse(input, context);
      if (!result.ok) {
        return result;
      }

      const key = result.output;
      context!.action((state) => ({ [key]: state[key] + 1 }))();

      return { ...result, context };
    },
  };
}

export function contextedParserWithUnistore(ctx = parserContext) {
  return context(createStore(ctx), parseDigitArray(parseDigitWithUnistore));
}
//#endregion
