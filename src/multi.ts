import type { IAlwaysOkParser, IParser, Input, Result } from './core.js'
import { ErrorKind } from './error.js'

interface MinCountError<T, E extends ErrorKind> {
  kind: E
  output: T[]
}

type NeverFailOnZeroCountParser<
  Count,
  T,
  E extends ErrorKind,
  I extends Input,
  CtxIn,
  CtxOut,
> = Count extends 0 ? IAlwaysOkParser<T[], I, CtxIn, CtxOut>
  : IParser<T[], MinCountError<T, E>, I, CtxIn, CtxOut>

/**
 * Repeat them embedded parser with
 * "min" times at minimum and "max" times at maximum.
 *
 * If repeat times is lower than minimum value,
 * it will produce a parsing error.
 * If repeat times reaches maximum value,
 * it will stop parsing and return parsed output.
 *
 *     many(alpha(), 1, 2)("").ok === false;
 *     many(alpha(), 1, 2)("a").output; // ==> ["a"]
 *     many(alpha(), 1, 2)("ab").output; // ==> ["a", "b"]
 *     many(alpha(), 1, 2)("abc").output; // ==> ["a", "b"]
 *     many(alpha(), 1, 2)("abc").input === "c";
 *
 * @param parser embedded parser
 * @param min minimum times (inclusive)
 * @param max maximum times (inclusive)
 */
export function many<
  T,
  E,
  I extends Input,
  CtxIn,
  CtxOut,
  Min extends number,
  Max extends number,
>(
  parser: IParser<T, E, I, CtxIn, CtxOut>,
  min: Min,
  max: Max,
): NeverFailOnZeroCountParser<Min, T, ErrorKind.Many, I, CtxIn, CtxOut> {
  if (min > max) {
    throw new RangeError('Maximum value must be greater than minimum value.')
  }

  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], MinCountError<T, ErrorKind.Many>, C & CtxOut> {
    const { min, max } = parse

    const output: T[] = []
    let count = 0

    let result = parser(input, context)
    while (result.ok && count < max) {
      count += 1
      input = result.input
      context = result.context
      output.push(result.output)
      result = parser(input, context)
    }

    if (count < min) {
      return {
        ok: false,
        input,
        error: { kind: ErrorKind.Many, output },
        context: context as C & CtxOut,
      }
    } else {
      return { ok: true, input, output, context: context as C & CtxOut }
    }
  }
  parse.min = min
  parse.max = max

  return parse as unknown as NeverFailOnZeroCountParser<
    Min,
    T,
    ErrorKind.Many,
    I,
    CtxIn,
    CtxOut
  >
}

/**
 * Repeat them embedded parser any times, at least 0.
 *
 *     many0(alpha())("").output; // ==> []
 *     many0(alpha())("a").output; // ==> ["a"]
 *     many0(alpha())("a1").output; // ==> ["a"]
 *     many0(alpha())("a1").input === "1";
 *
 * @param parser embedded parser
 */
export function many0<T, E, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, E, I, CtxIn, CtxOut>,
): IParser<T[], E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], E, C & CtxOut> {
    const items: T[] = []

    let result = parse.parser(input, context)
    while (result.ok) {
      items.push(result.output)
      result = parser(result.input, result.context)
    }

    return {
      ok: true,
      input: result.input,
      output: items,
      context: result.context,
    }
  }
  parse.parser = parser

  return parse
}

/**
 * Repeat them embedded parser at least once.
 *
 *     many1(alpha())("").ok === false;
 *     many1(alpha())("a").output; // ==> ["a"]
 *     many1(alpha())("a1").output; // ==> ["a"]
 *     many1(alpha())("a1").input === "1";
 *
 * @param parser embedded parser
 */
export function many1<T, E, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, E, I, CtxIn, CtxOut>,
): IParser<T[], E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], E, C & CtxOut> {
    const items: T[] = []

    let result = parse.parser(input, context)
    if (!result.ok) {
      return result
    }

    while (result.ok) {
      items.push(result.output)
      result = parse.parser(result.input, result.context)
    }

    return {
      ok: true,
      input: result.input,
      output: items,
      context: result.context,
    }
  }
  parse.parser = parser

  return parse
}

/**
 * Repeat the embedded parser until the "end" parser succeeded.
 *
 *     const result = manyUntil(digit(), alpha())("123abc");
 *     result.input === "abc";
 *     result.output; // ==> ["1", "2", "3"]
 *
 * @param parser embedded parser
 * @param end end parser
 */
export function manyUntil<T, U, E, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, E, I, CtxIn, CtxOut>,
  end: IParser<U, unknown, I, CtxIn, CtxOut>,
): IParser<T[], E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], E, C & CtxOut> {
    const { parser, end } = parse
    const output: T[] = []

    while (true) {
      const endResult = end(input, context)
      if (endResult.ok) {
        return {
          ok: true,
          input,
          output,
          context: context as C & CtxOut,
        }
      }

      const result = parser(input, context)
      if (result.ok) {
        input = result.input
        context = result.context
        output.push(result.output)
      } else {
        return result
      }
    }
  }
  parse.parser = parser
  parse.end = end

  return parse
}

/**
 * Execute the embedded parser in specified times,
 * with another parser as separator,
 * then produce a list of values.
 *
 * If separator is trailing,
 * it will be treated as the rest of input without parsing.
 *
 *     sepBy(char(","), digit())("1,2").output; // ==> ["1", "2"]
 *     sepBy(char(","), digit())("1,2,").output; // ==> ["1", "2"]
 *     sepBy(char(","), digit())("1,2,").input === ",";
 *     sepBy(char(","), digit(), 1)("").ok === false;
 *     sepBy(char(","), digit(), 0, 1)("1,2").output; // ==> ["1"]
 *     sepBy(char(","), digit(), 0, 1)("1,2").input === ",2";
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 * @param min minimum times (inclusive), default is `0`
 * @param max maximum times (inclusive), default is `Infinity`
 */
export function sepBy<T, E, I extends Input, CtxIn, CtxOut, Min extends number>(
  separator: IParser<unknown, unknown, I, CtxIn, CtxOut>,
  parser: IParser<T, E, I, CtxIn, CtxOut>,
  min: Min | 0 = 0,
  max = Infinity,
): NeverFailOnZeroCountParser<Min, T, ErrorKind.SepBy, I, CtxIn, CtxOut> {
  if (min > max) {
    throw new RangeError('Maximum value must be greater than minimum value.')
  }

  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], MinCountError<T, ErrorKind.SepBy>, C & CtxOut> {
    const { min, max, parser, separator } = parse
    const output: T[] = []

    let count = 0
    let result = parser(input, context)
    while (result.ok && count < max) {
      output.push(result.output)
      input = result.input
      context = result.context
      count += 1

      const sep = separator(input, context)
      if (!sep.ok) {
        break
      }

      result = parser(sep.input, sep.context)
    }

    if (count < min) {
      return {
        ok: false,
        input,
        error: {
          kind: ErrorKind.SepBy,
          output,
        },
        context: context as C & CtxOut,
      }
    } else {
      return { ok: true, input, output, context: context as C & CtxOut }
    }
  }
  parse.parser = parser
  parse.separator = separator
  parse.min = min
  parse.max = max

  return parse as unknown as NeverFailOnZeroCountParser<
    Min,
    T,
    ErrorKind.SepBy,
    I,
    CtxIn,
    CtxOut
  >
}

/**
 * Execute the embedded parser at least once with another parser as separator,
 * then produce a list of values.
 *
 * If separator is trailing,
 * it will be treated as the rest of input without parsing.
 *
 *     sepBy1(char(","), digit())("1,2").output; // ==> ["1", "2"]
 *     sepBy1(char(","), digit())("1,2,").output; // ==> ["1", "2"]
 *     sepBy1(char(","), digit())("1,2,").input === ",";
 *     sepBy1(char(","), digit())("").ok === false;
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 */
export function sepBy1<T, E, I extends Input, CtxIn, CtxOut>(
  separator: IParser<unknown, unknown, I, CtxIn, CtxOut>,
  parser: IParser<T, E, I, CtxIn, CtxOut>,
): IParser<T[], E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], E, C & CtxOut> {
    const { parser, separator } = parse
    const output: T[] = []

    let result = parser(input, context)
    if (!result.ok) {
      return result
    }

    while (result.ok) {
      output.push(result.output)
      input = result.input
      context = result.context

      const sep = separator(input, context)
      if (!sep.ok) {
        break
      }

      result = parser(sep.input, context)
    }

    return { ok: true, input, output, context: context as C & CtxOut }
  }
  parse.parser = parser
  parse.separator = separator

  return parse
}

/**
 * Execute the embedded parser in specified times,
 * with another parser as separator,
 * then produce a list of values.
 * Separator can be trailing.
 *
 *     sepEndBy(char(","), digit())("1,2").output; // ==> ["1", "2"]
 *     sepEndBy(char(","), digit())("1,2,").output; // ==> ["1", "2"]
 *     sepEndBy(char(","), digit())("1,2,").input === "";
 *     sepEndBy(char(","), digit(), 1)("").ok === false;
 *     sepEndBy(char(","), digit(), 0, 1)("1,2").output; // ==> ["1"]
 *     sepEndBy(char(","), digit(), 0, 1)("1,2").input === "2";
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 * @param min minimum times (inclusive), default is `0`
 * @param max maximum times (inclusive), default is `Infinity`
 */
export function sepEndBy<
  T,
  E,
  I extends Input,
  CtxIn,
  CtxOut,
  Min extends number,
>(
  separator: IParser<unknown, unknown, I, CtxIn, CtxOut>,
  parser: IParser<T, E, I, CtxIn, CtxOut>,
  min: Min | 0 = 0,
  max = Infinity,
): NeverFailOnZeroCountParser<Min, T, ErrorKind.SepEndBy, I, CtxIn, CtxOut> {
  if (min > max) {
    throw new RangeError('Maximum value must be greater than minimum value.')
  }

  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], MinCountError<T, ErrorKind.SepEndBy>, C & CtxOut> {
    const { min, max, parser, separator } = parse
    const output: T[] = []

    let count = 0
    let result = parser(input, context)
    while (result.ok && count < max) {
      output.push(result.output)
      input = result.input
      context = result.context
      count += 1

      const sep = separator(input, context)
      input = sep.input
      context = sep.context
      if (!sep.ok) {
        break
      }

      result = parser(input, context)
    }

    if (count < min) {
      return {
        ok: false,
        input,
        error: {
          kind: ErrorKind.SepEndBy,
          output,
        },
        context: context as C & CtxOut,
      }
    } else {
      return { ok: true, input, output, context: context as C & CtxOut }
    }
  }
  parse.parser = parser
  parse.separator = separator
  parse.min = min
  parse.max = max

  return parse as unknown as NeverFailOnZeroCountParser<
    Min,
    T,
    ErrorKind.SepEndBy,
    I,
    CtxIn,
    CtxOut
  >
}

/**
 * Execute the embedded parser at least once with another parser as separator,
 * then produce a list of values.
 * Separator can be trailing.
 *
 *     sepEndBy1(char(","), digit())("1,2").output; // ==> ["1", "2"]
 *     sepEndBy1(char(","), digit())("1,2,").output; // ==> ["1", "2"]
 *     sepEndBy1(char(","), digit())("1,2,").input === "";
 *     sepEndBy1(char(","), digit())("").ok === false;
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 */
export function sepEndBy1<T, E, I extends Input, CtxIn, CtxOut>(
  separator: IParser<unknown, unknown, I, CtxIn, CtxOut>,
  parser: IParser<T, E, I, CtxIn, CtxOut>,
): IParser<T[], E, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, T[], E, C & CtxOut> {
    const output: T[] = []

    let result = parser(input, context)
    if (!result.ok) {
      return result
    }

    while (result.ok) {
      output.push(result.output)
      input = result.input
      context = result.context

      const sep = separator(input, context)
      input = sep.input
      context = sep.context
      if (!sep.ok) {
        break
      }

      result = parser(sep.input, context)
    }

    return { ok: true, input, output, context: context as C & CtxOut }
  }
  parse.parser = parser
  parse.separator = separator

  return parse
}
