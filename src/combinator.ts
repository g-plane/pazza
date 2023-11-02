import type { IAlwaysOkParser, IParser, Input, Ok, Result } from './core.js'
import { ErrorKind } from './error.js'

/**
 * Execute the embedded parser.
 * If it succeeds, apply provided function on the output.
 *
 *     const parser = map(digit(), value => Number.parseInt(value));
 *     parser("5").output === 5;
 *
 * @param parser embededd parser
 * @param fn function to be applied on successful output
 */
export function map<T, U, E, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, E, I, CtxIn, CtxOut>,
  fn: (output: T) => U,
): IParser<U, E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, U, E, C & CtxOut> {
    const result = parse.parser(input, context)
    if (result.ok) {
      return { ...result, output: parse.fn(result.output) }
    } else {
      return result
    }
  }
  parse.parser = parser
  parse.fn = fn

  return parse
}

/**
 * Execute the embedded parser.
 * If it fails, apply provided function on the error.
 *
 *     const parser = map(digit(), error => "Not a digit.");
 *     parser("a").error === "Not a digit.";
 *
 * @param parser embededd parser
 * @param fn function to be applied on error
 */
export function mapErr<T, E1, E2, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, E1, I, CtxIn, CtxOut>,
  fn: (error: E1) => E2,
): IParser<T, E2, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T, E2, C & CtxOut> {
    const result = parse.parser(input, context)
    if (result.ok) {
      return result
    } else {
      return { ...result, error: parse.fn(result.error) }
    }
  }
  parse.parser = parser
  parse.fn = fn

  return parse
}

/**
 * Execute the embedded parser.
 * If it succeeds, return its value.
 * If it fails, return `null` with a successful result.
 *
 *     const result = optional(digit())("a");
 *     result.ok === true;
 *     result.output === null;
 *
 * @param parser embedded parser
 */
export function optional<T, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, unknown, I, CtxIn, CtxOut>,
): IAlwaysOkParser<T | null, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Ok<I, T | null, C & CtxOut> {
    const result = parse.parser(input, context)
    if (result.ok) {
      return result
    } else {
      return {
        ok: true,
        input,
        output: null,
        context: result.context,
      }
    }
  }
  parse.parser = parser

  return parse
}

/**
 * Pick next character from input and pass it to provided predicate.
 * If the predicate passes, return a successful parsing result with that character.
 * If not, return a parsing error.
 *
 *     satisfy((char) => char === "a")("a").output === "a";
 *     satisfy((char) => char === "a")("b").ok === false;
 *
 * @param predicate predicate which tests next character
 */
export function satisfy<I extends string>(
  predicate: (item: I[0]) => boolean,
): IParser<I[0], ErrorKind.Satisfy, I>
/**
 * Pick next byte from input and pass it to provided predicate.
 * If the predicate passes, return a successful parsing result with that byte.
 * If not, return a parsing error.
 *
 *     satisfy((byte) => byte === 10)(Uint8Array.of(10)).output === 10;
 *     satisfy((byte) => byte === 10)(Uint8Array.of(13)).ok === false;
 *
 * @param predicate predicate which tests next byte (8-bit unsigned integer)
 */
export function satisfy<I extends Uint8Array>(
  predicate: (item: I[0]) => boolean,
): IParser<I[0], ErrorKind.Satisfy, I>
export function satisfy(
  predicate: (item: Input[0]) => boolean,
): IParser<Input[0], ErrorKind.Satisfy, Input> {
  function parse<C>(
    input: Input,
    context: C = Object.create(null),
  ): Result<Input, Input[0], ErrorKind.Satisfy, C> {
    const first = input[0]

    if (parse.predicate(first)) {
      return {
        ok: true,
        input: input.slice(1),
        output: first,
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Satisfy,
        context,
      }
    }
  }
  parse.predicate = predicate

  return parse
}
