import type { _format } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import type { IParser, Input, Result } from "./core.ts";

export function or<L, R, EL, ER, I extends Input>(
  left: IParser<L, EL, I>,
  right: IParser<R, ER, I>,
): IParser<L | R, EL | ER, I> {
  return {
    parse(input) {
      const result = left.parse(input);
      if (result.ok) {
        return result;
      } else {
        return right.parse(input);
      }
    },
  };
}

type ChoiceOutput<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = P[number] extends IParser<infer O, infer _, I> ? O : never;
type ChoiceError<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = P[number] extends IParser<infer _, infer E, I> ? E : never;
type ChoiceResult<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = Result<I, ChoiceOutput<I, P>, ChoiceError<I, P>>;

export function choice<
  P extends readonly IParser<unknown, unknown, string>[],
>(
  ...parsers: P
): IParser<ChoiceOutput<string, P>, ChoiceError<string, P>, string> & {
  parsers: P;
};
export function choice<
  P extends readonly IParser<unknown, unknown, Uint8Array>[],
>(
  ...parsers: P
): IParser<ChoiceOutput<Uint8Array, P>, ChoiceError<Uint8Array, P>, string> & {
  parsers: P;
};
export function choice<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
>(
  ...parsers: P
): IParser<ChoiceOutput<I, P>, ChoiceError<I, P>, I> & { parsers: P } {
  return {
    parsers,
    parse(input) {
      const { parsers } = this;
      const lastIndex = parsers.length - 1;
      for (let i = 0; i < lastIndex; i += 1) {
        const result = parsers[i].parse(input);
        if (result.ok) {
          return result as ChoiceResult<I, P>;
        }
      }

      return parsers[lastIndex].parse(input) as ChoiceResult<I, P>;
    },
  };
}
