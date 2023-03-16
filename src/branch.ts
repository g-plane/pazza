import type { IParser, Input, Result } from './core.js'

/**
 * Attempt to run "left" parser at first.
 * If it succeeds, return its result.
 * If it fails, run "right" parser.
 *
 *     or(digit(), alpha())("4").output === "4";
 *     or(digit(), alpha())("a").output === "a";
 *     or(digit(), alpha())("").ok === false;
 *
 * @param left left parser
 * @param right right parser
 */
export function or<L, R, E, I extends Input, CtxIn, CtxOut>(
  left: IParser<L, unknown, I, CtxIn, CtxOut>,
  right: IParser<R, E, I, CtxIn, CtxOut>
): IParser<L | R, E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null)
  ): Result<I, L | R, E, C & CtxOut> {
    const result = left(input, context)
    if (result.ok) {
      return result
    } else {
      return right(input, context)
    }
  }
  parse.left = left
  parse.right = right

  return parse
}

type ChoiceOutput<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = P[number] extends IParser<infer O, infer _, I, infer _, infer _> ? O : never
type ChoiceError<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = P[number] extends IParser<infer _, infer E, I, infer _, infer _> ? E : never
type ChoiceCtxIn<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = P[number] extends IParser<infer _, infer _, I, infer C, infer _> ? C : never
type ChoiceCtxOut<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = P[number] extends IParser<infer _, infer _, I, infer _, infer C> ? C : never
type ChoiceParser<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = IParser<
  ChoiceOutput<I, P>,
  ChoiceError<I, P>,
  I,
  ChoiceCtxIn<I, P>,
  ChoiceCtxOut<I, P>
>
type ChoiceResult<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = Result<
  I,
  ChoiceOutput<I, P>,
  ChoiceError<I, P>,
  ChoiceCtxIn<I, P> & ChoiceCtxOut<I, P>
>

/**
 * Attempt to run each parser of a list of parsers.
 * Once a parser succeeds, return its result.
 * If no parsers succeed, return last result.
 *
 *     const parser = choice(char("-"), char("+"), char("."));
 *     parser("-").output === "-";
 *     parser("+").output === "+";
 *     parser(".").output === ".";
 *     parser("").ok === false;
 *
 * @param parsers Alternative parsers. Order is insensitive.
 */
export function choice<
  P extends readonly IParser<unknown, unknown, string, unknown, unknown>[]
>(...parsers: P): ChoiceParser<string, P>
/**
 * Attempt to run each parser of a list of parsers.
 * Once a parser succeeds, return its result.
 * If no parsers succeed, return last result.
 *
 *     const parser = choice(byte(1), byte(2), byte(3));
 *     parser(Uint8Array.of(1)).output === 1;
 *     parser(Uint8Array.of(2)).output === 2;
 *     parser(Uint8Array.of(3)).output === 3;
 *     parser(Uint8Array.of()).ok === false;
 *
 * @param parsers Alternative parsers. Order is insensitive.
 */
export function choice<
  P extends readonly IParser<unknown, unknown, Uint8Array, unknown, unknown>[]
>(...parsers: P): ChoiceParser<Uint8Array, P>
export function choice<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
>(...parsers: P): ChoiceParser<I, P> {
  function parse<C extends ChoiceCtxIn<I, P>>(
    input: I,
    context: C = Object.create(null)
  ): ChoiceResult<I, P> {
    const { parsers } = parse
    const lastIndex = parsers.length - 1
    for (let i = 0; i < lastIndex; i += 1) {
      const result = parsers[i](input, context)
      if (result.ok) {
        return result as ChoiceResult<I, P>
      }
    }

    return parsers[lastIndex](input, context) as ChoiceResult<I, P>
  }
  parse.parsers = parsers

  return parse as ChoiceParser<I, P>
}
