import type { IParser, Input, Result } from "./core.ts";

/**
 * Attempt to run "left" parser at first.
 * If it succeeds, return its result.
 * If it fails, run "right" parser.
 *
 *     or(digit(), alpha()).parse("4").output === "4";
 *     or(digit(), alpha()).parse("a").output === "a";
 *     or(digit(), alpha()).parse("").ok === false;
 *
 * @param left left parser
 * @param right right parser
 */
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
type ChoiceParser<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = IParser<ChoiceOutput<I, P>, ChoiceError<I, P>, I> & { parsers: P };
type ChoiceResult<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = Result<I, ChoiceOutput<I, P>, ChoiceError<I, P>>;

/**
 * Attempt to run each parser of a list of parsers.
 *
 *     const parser = choice(char("-"), char("+"), char("."));
 *     parser.parse("-").output === "-";
 *     parser.parse("+").output === "+";
 *     parser.parse(".").output === ".";
 *     parser.parse("").ok === false;
 *
 * @param parsers
 */
export function choice<P extends readonly IParser<unknown, unknown, string>[]>(
  ...parsers: P
): ChoiceParser<string, P>;
/**
 * Attempt to run each parser of a list of parsers.
 *
 *     const parser = choice(byte(1), byte(2), byte(3));
 *     parser.parse(Uint8Array.of(1)).output === 1;
 *     parser.parse(Uint8Array.of(2)).output === 2;
 *     parser.parse(Uint8Array.of(3)).output === 3;
 *     parser.parse(Uint8Array.of()).ok === false;
 *
 * @param parsers Alternative parsers. Order is insensitive.
 */
export function choice<
  P extends readonly IParser<unknown, unknown, Uint8Array>[],
>(...parsers: P): ChoiceParser<Uint8Array, P>;
export function choice<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
>(...parsers: P): ChoiceParser<I, P> {
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
