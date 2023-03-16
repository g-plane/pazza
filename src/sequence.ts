import type { IParser, Input, Result } from './core.js'

/**
 * Execute the embedded parser with a specified prefix and suffix.
 *
 * If the prefix parser or suffix parser fails, the whole parser will fail.
 *
 *     const parser = between(char("["), char("]"), digit());
 *     parser("[5]").output === "5";
 *     parser("(5]").ok === false;
 *     parser("[a]").ok === false;
 *     parser("[5)").ok === false;
 *
 * @param start Parser to parse the prefix.
 * @param end Parser to parse the suffix.
 * @param parser Embedded parser.
 */
export function between<T, EL, ER, ET, I extends Input, CtxIn, CtxOut>(
  start: IParser<unknown, EL, I, CtxIn, CtxOut>,
  end: IParser<unknown, ER, I, CtxIn, CtxOut>,
  parser: IParser<T, ET, I, CtxIn, CtxOut>
): IParser<T, EL | ER | ET, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null)
  ): Result<I, T, EL | ER | ET, C & CtxOut> {
    const left = parse.start(input, context)
    if (!left.ok) {
      return left
    }

    const mid = parse.parser(left.input, left.context)
    if (!mid.ok) {
      return mid
    }

    const right = parse.end(mid.input, mid.context)
    if (!right.ok) {
      return right
    }

    return {
      ok: true,
      input: right.input,
      output: mid.output,
      context: right.context,
    }
  }
  parse.start = start
  parse.parser = parser
  parse.end = end

  return parse
}

type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => void : never
) extends (arg: infer T) => void
  ? T
  : never

type SerialOutput<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = {
  [K in keyof P]: P[K] extends IParser<infer O, infer _, I, infer _, infer _>
    ? O
    : never
}
type SerialError<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = P[number] extends IParser<infer _, infer E, I, infer _, infer _> ? E : never
type SerialCtxIn<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = UnionToIntersection<
  P[number] extends IParser<infer _, infer _, I, infer C, infer _> ? C : never
>
type SerialCtxOut<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I, unknown, unknown>[]
> = UnionToIntersection<
  P[number] extends IParser<infer _, infer _, I, infer _, infer C> ? C : never
>
type SerialParser<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[]
> = IParser<
  SerialOutput<I, P>,
  SerialError<I, P>,
  I,
  SerialCtxIn<I, P>,
  SerialCtxOut<I, P>
>

/**
 * Execute a series of parsers and follow its order.
 * Once a parser fails,
 * the whole parser will fail and return last parsing error.
 *
 *     const parser = serial(char("<"), char("-"), char(">"));
 *     parser("<->").output; // ==> ["<", "-", ">"]
 *     parser(">-<").ok === false;
 *     parser("<-!").ok === false;
 *     parser("<_>").ok === false;
 *
 * @param parsers Series of parser. Order is sensitive.
 */
export function serial<
  P extends IParser<unknown, unknown, string, unknown, unknown>[]
>(...parsers: P): SerialParser<string, P>
/**
 * Execute a series of parsers and follow its order.
 * Once a parser fails,
 * the whole parser will fail and return last parsing error.
 *
 *     const parser = serial(byte(13), byte(10), byte(65));
 *     parser(Uint8Array.of(13, 10, 65)).output; // ==> Uint8Array [13, 10, 65]
 *     parser(Uint8Array.of(13, 65, 10)).ok === false;
 *     parser(Uint8Array.of(13, 10, 66)).ok === false;
 *     parser(Uint8Array.of(13, 11, 65)).ok === false;
 *
 * @param parsers Series of parser. Order is sensitive.
 */
export function serial<
  P extends IParser<unknown, unknown, Uint8Array, unknown, unknown>[]
>(...parsers: P): SerialParser<Uint8Array, P>
export function serial<
  I extends Input,
  P extends IParser<unknown, unknown, I, unknown, unknown>[]
>(...parsers: P): SerialParser<I, P> {
  function parse<C extends SerialCtxIn<I, P>>(
    input: I,
    context: C = Object.create(null)
  ): Result<I, SerialOutput<I, P>, SerialError<I, P>, C & SerialCtxOut<I, P>> {
    const output: unknown[] = []

    for (const parser of parse.parsers) {
      const result = parser(input, context)
      if (!result.ok) {
        return result as {
          ok: false
          input: I
          error: SerialError<I, P>
          context: C & SerialCtxOut<I, P>
        }
      }

      input = result.input
      context = result.context
      output.push(result.output)
    }

    return {
      ok: true,
      input,
      output: output as SerialOutput<I, P>,
      context: context as C & SerialCtxOut<I, P>,
    }
  }
  parse.parsers = parsers

  return parse
}

/**
 * Execute the "prefix" parse first.
 * If it succeeds, discard its result and execute the following normal parser.
 *
 * If any of both parsers fails, the whole parser will fail.
 *
 *     const parser = prefix(char("<"), digit());
 *     parser("<5").output === "5";
 *     parser("[5").ok === false;
 *     parser("<a").ok === false;
 *
 * @param prefix parser to parse prefix
 * @param parser parser to parse normal stuff
 */
export function prefix<T, ET, EP, I extends Input, CtxIn, CtxOut>(
  prefix: IParser<unknown, EP, I, CtxIn, CtxOut>,
  parser: IParser<T, ET, I, CtxIn, CtxOut>
): IParser<T, ET | EP, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null)
  ): Result<I, T, ET | EP, C & CtxOut> {
    const preceded = parse.prefix(input, context)
    if (!preceded.ok) {
      return preceded
    }

    return parse.parser(preceded.input, preceded.context)
  }
  parse.parser = parser
  parse.prefix = prefix

  return parse
}

/**
 * Execute the normal parser first.
 * If it succeeds, execute the following "suffix" parser
 * and discard the output of the "suffix" parser if succeeds.
 *
 * If any of both parsers fails, the whole parser will fail.
 *
 *     const parser = suffix(digit(), char(">"));
 *     parser("5>").output === "5";
 *     parser("5]").ok === false;
 *     parser("a>").ok === false;
 *
 * @param parser parser to parse normal stuff
 * @param suffix parser to parse suffix
 */
export function suffix<T, ET, ES, I extends Input, CtxIn, CtxOut>(
  parser: IParser<T, ET, I, CtxIn, CtxOut>,
  suffix: IParser<unknown, ES, I, CtxIn, CtxOut>
): IParser<T, ET | ES, I, CtxIn, CtxOut> {
  function parse<C extends CtxIn>(
    input: I,
    context: C = Object.create(null)
  ): Result<I, T, ET | ES, C & CtxOut> {
    const result = parser(input, context)
    if (!result.ok) {
      return result
    }

    const terminated = suffix(result.input, result.context)
    if (terminated.ok) {
      return { ...terminated, output: result.output }
    } else {
      return terminated
    }
  }
  parse.parser = parser
  parse.suffix = suffix

  return parse
}
