import type { IParser, Result } from './core.js'
import { ErrorKind } from './error.js'

/**
 * Parse a specified string.
 *
 *     const parser = string("ab");
 *     parser("ab").output === "ab";
 *     parser("ac").ok === false;
 *
 * @param literal string literal
 */
export function string<S extends string>(
  literal: S
): IParser<S, ErrorKind.String, string> {
  function parse<C, I extends string>(
    input: I,
    context: C = Object.create(null)
  ): Result<string, S, ErrorKind.String, C> {
    const { literal } = parse
    if (input.slice(0, literal.length) === literal) {
      return {
        ok: true,
        input: input.slice(literal.length),
        output: literal,
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.String,
        context,
      }
    }
  }
  parse.literal = literal

  return parse
}

/**
 * Parse a string, which embedded character parser will succeed at least once.
 *
 *     string1(digit())("123").output === "123";
 *     string1(digit())("abc").ok === false;
 *     string1(digit())("").output === "";
 *
 * @param charParser embedded character parser
 */
export function string0<E, CtxIn, CtxOut>(
  charParser: IParser<string, E, string, CtxIn, CtxOut>
): IParser<string, E, string, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: string,
    context: C = Object.create(null)
  ): Result<string, string, E, C & CtxOut> {
    const { charParser } = parse
    let output = ''

    let result = charParser(input, context)
    while (result.ok) {
      output += result.output
      input = result.input
      context = result.context

      result = charParser(input, context)
    }

    return {
      ok: true,
      input,
      output,
      context: context as C & CtxOut,
    }
  }
  parse.charParser = charParser

  return parse
}

/**
 * Parse a string, which embedded character parser will succeed at least once.
 *
 *     string1(digit())("123").output === "123";
 *     string1(digit())("abc").ok === false;
 *     string1(digit())("").ok === false;
 *
 * @param charParser embedded character parser
 */
export function string1<E, CtxIn, CtxOut>(
  charParser: IParser<string, E, string, CtxIn, CtxOut>
): IParser<string, E, string, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: string,
    context: C = Object.create(null)
  ): Result<string, string, E, C & CtxOut> {
    const { charParser } = parse
    let output = ''

    let result = charParser(input, context)
    if (!result.ok) {
      return result
    }

    while (result.ok) {
      output += result.output
      input = result.input
      context = result.context

      result = charParser(input, context)
    }

    return {
      ok: true,
      input,
      output,
      context: context as C & CtxOut,
    }
  }
  parse.charParser = charParser

  return parse
}
