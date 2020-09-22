import type { IParser, Input } from "./core.ts";

/**
 * Execute the embedded parser with a specified prefix and suffix.
 *
 * If the prefix parser or suffix parser fails, the whole parser will fail.
 *
 *     const parser = between(char("["), char("]"), digit());
 *     parser.parse("[5]").output === "5";
 *     parser.parse("(5]").ok === false;
 *     parser.parse("[a]").ok === false;
 *     parser.parse("[5)").ok === false;
 *
 * @param start Parser to parse the prefix.
 * @param end Parser to parse the suffix.
 * @param parser Embedded parser.
 */
export function between<L, R, T, EL, ER, ET, I extends Input>(
  start: IParser<L, EL, I>,
  end: IParser<R, ER, I>,
  parser: IParser<T, ET, I>,
): IParser<T, EL | ER | ET, I> {
  return {
    parse(input, context) {
      const left = start.parse(input, context);
      if (!left.ok) {
        return left;
      }

      const mid = parser.parse(left.input, left.context);
      if (!mid.ok) {
        return mid;
      }

      const right = end.parse(mid.input, mid.context);
      if (!right.ok) {
        return right;
      }

      return {
        ok: true,
        input: right.input,
        output: mid.output,
        context: right.context,
      };
    },
  };
}

type SerialOutput<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = { [K in keyof P]: P[K] extends IParser<infer O, infer _, I> ? O : never };
type SerialError<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = P[number] extends IParser<infer _, infer E, I> ? E : never;
type SerialParser<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
> = IParser<SerialOutput<I, P>, SerialError<I, P>, I> & { parsers: P };

/**
 * Execute a series of parsers and follow its order.
 * Once a parser fails,
 * the whole parser will fail and return last parsing error.
 *
 *     const parser = serial(char("<"), char("-"), char(">"));
 *     parser.parse("<->").output; // ==> ["<", "-", ">"]
 *     parser.parse(">-<").ok === false;
 *     parser.parse("<-!").ok === false;
 *     parser.parse("<_>").ok === false;
 *
 * @param parsers Series of parser. Order is sensitive.
 */
export function serial<P extends IParser<unknown, unknown, string>[]>(
  ...parsers: P
): SerialParser<string, P>;
/**
 * Execute a series of parsers and follow its order.
 * Once a parser fails,
 * the whole parser will fail and return last parsing error.
 *
 *     const parser = serial(byte(13), byte(10), byte(65));
 *     parser.parse(Uint8Array.of(13, 10, 65)).output; // ==> Uint8Array [13, 10, 65]
 *     parser.parse(Uint8Array.of(13, 65, 10)).ok === false;
 *     parser.parse(Uint8Array.of(13, 10, 66)).ok === false;
 *     parser.parse(Uint8Array.of(13, 11, 65)).ok === false;
 *
 * @param parsers Series of parser. Order is sensitive.
 */
export function serial<P extends IParser<unknown, unknown, Uint8Array>[]>(
  ...parsers: P
): SerialParser<Uint8Array, P>;
export function serial<
  I extends Input,
  P extends IParser<unknown, unknown, I>[],
>(...parsers: P): SerialParser<I, P> {
  return {
    parsers,
    parse<C>(input: I, context?: C) {
      const { parsers } = this;
      const output: unknown[] = [];

      for (const parser of parsers) {
        const result = parser.parse(input, context);
        if (!result.ok) {
          return result as {
            ok: false;
            input: I;
            error: SerialError<I, P>;
            context: C | undefined;
          };
        }

        input = result.input;
        context = result.context;
        output.push(result.output);
      }

      return {
        ok: true,
        input,
        output: output as SerialOutput<I, P>,
        context,
      };
    },
  };
}

interface PrefixParser<T, ET, EP, I extends Input>
  extends IParser<T, ET | EP, I> {
  prefix: IParser<unknown, EP, I>;
  parser: IParser<T, ET, I>;
}
/**
 * Execute the "prefix" parse first.
 * If it succeeds, discard its result and execute the following normal parser.
 *
 * If any of both parsers fails, the whole parser will fail.
 *
 *     const parser = prefix(char("<"), digit());
 *     parser.parse("<5").output === "5";
 *     parser.parse("[5").ok === false;
 *     parser.parse("<a").ok === false;
 *
 * @param prefix parser to parse prefix
 * @param parser parser to parse normal stuff
 */
export function prefix<T, ET, EP, I extends Input>(
  prefix: IParser<unknown, EP, I>,
  parser: IParser<T, ET, I>,
): PrefixParser<T, ET, EP, I> {
  return {
    prefix,
    parser,
    parse(input, context) {
      const { prefix, parser } = this;

      const preceded = prefix.parse(input, context);
      if (!preceded.ok) {
        return preceded;
      }

      return parser.parse(preceded.input, preceded.context);
    },
  };
}

interface SuffixParser<T, ET, ES, I extends Input>
  extends IParser<T, ET | ES, I> {
  parser: IParser<T, ET, I>;
  suffix: IParser<unknown, ES, I>;
}
/**
 * Execute the normal parser first.
 * If it succeeds, execute the following "suffix" parser
 * and discard the output of the "suffix" parser if succeeds.
 *
 * If any of both parsers fails, the whole parser will fail.
 *
 *     const parser = suffix(digit(), char(">"));
 *     parser.parse("5>").output === "5";
 *     parser.parse("5]").ok === false;
 *     parser.parse("a>").ok === false;
 *
 * @param parser parser to parse normal stuff
 * @param suffix parser to parse suffix
 */
export function suffix<T, ET, ES, I extends Input>(
  parser: IParser<T, ET, I>,
  suffix: IParser<unknown, ES, I>,
): SuffixParser<T, ET, ES, I> {
  return {
    parser,
    suffix,
    parse(input, context) {
      const { parser, suffix } = this;

      const result = parser.parse(input, context);
      if (!result.ok) {
        return result;
      }

      const terminated = suffix.parse(result.input, result.context);
      if (terminated.ok) {
        return { ...terminated, output: result.output };
      } else {
        return terminated;
      }
    },
  };
}
