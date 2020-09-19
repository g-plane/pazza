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
    parse(input) {
      const left = start.parse(input);
      if (!left.ok) {
        return left;
      }

      const mid = parser.parse(left.input);
      if (!mid.ok) {
        return mid;
      }

      const right = end.parse(mid.input);
      if (!right.ok) {
        return right;
      }

      return {
        ok: true,
        input: right.input,
        output: mid.output,
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
    parse(input) {
      const { parsers } = this;
      const output: unknown[] = [];

      for (const parser of parsers) {
        const result = parser.parse(input);
        if (!result.ok) {
          return result as {
            ok: false;
            input: I;
            error: SerialError<I, P>;
          };
        }

        input = result.input;
        output.push(result.output);
      }

      return {
        ok: true,
        input,
        output: output as SerialOutput<I, P>,
      };
    },
  };
}
