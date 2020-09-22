import type { IParser, Input, Result } from "./core.ts";
import { ErrorKind } from "./error.ts";

interface MinCountError<T, E extends ErrorKind> {
  kind: E;
  output: T[];
}

interface ManyParser<T, E, I extends Input>
  extends IParser<T[], E | MinCountError<T, ErrorKind.Many>, I> {
  min: number;
  max: number;
}
/**
 * Repeat them embedded parser with
 * "m" times at minimum and "n" times at maximum.
 *
 * If repeat times is lower than minimum value,
 * it will produce a parsing error.
 * If repeat times reaches maximum value,
 * it will stop parsing and return parsed output.
 *
 *     many(alpha(), 1, 2).parse("").ok === false;
 *     many(alpha(), 1, 2).parse("a").output; // ==> ["a"]
 *     many(alpha(), 1, 2).parse("ab").output; // ==> ["a", "b"]
 *     many(alpha(), 1, 2).parse("abc").output; // ==> ["a", "b"]
 *     many(alpha(), 1, 2).parse("abc").input === "c";
 *
 * @param parser embedded parser
 * @param m minimum times (inclusive)
 * @param n maximum times (inclusive)
 */
export function many<T, E, I extends Input>(
  parser: IParser<T, E, I>,
  m: number,
  n: number,
): ManyParser<T, E, I> {
  return {
    min: Math.min(m, n),
    max: Math.max(m, n),
    parse(input, context) {
      const { min, max } = this;

      const output: T[] = [];
      let count = 0;

      let result = parser.parse(input, context);
      while (result.ok && count < max) {
        count += 1;
        input = result.input;
        context = result.context;
        output.push(result.output);
        result = parser.parse(input, context);
      }

      if (count < min) {
        return {
          ok: false,
          input,
          error: { kind: ErrorKind.Many, output },
          context: result.context,
        };
      } else {
        return { ok: true, input, output, context };
      }
    },
  };
}

/**
 * Repeat them embedded parser any times, at least 0.
 *
 *     many0(alpha()).parse("").output; // ==> []
 *     many0(alpha()).parse("a").output; // ==> ["a"]
 *     many0(alpha()).parse("a1").output; // ==> ["a"]
 *     many0(alpha()).parse("a1").input === "1";
 *
 * @param parser embedded parser
 */
export function many0<T, E, I extends Input>(
  parser: IParser<T, E, I>,
): IParser<T[], E, I> {
  return {
    parse(input, context) {
      const items: T[] = [];

      let result = parser.parse(input, context);
      while (result.ok) {
        items.push(result.output);
        result = parser.parse(result.input, result.context);
      }

      return {
        ok: true,
        input: result.input,
        output: items,
        context: result.context,
      };
    },
  };
}

/**
 * Repeat them embedded parser at least once.
 *
 *     many1(alpha()).parse("").ok === false;
 *     many1(alpha()).parse("a").output; // ==> ["a"]
 *     many1(alpha()).parse("a1").output; // ==> ["a"]
 *     many1(alpha()).parse("a1").input === "1";
 *
 * @param parser embedded parser
 */
export function many1<T, E, I extends Input>(
  parser: IParser<T, E, I>,
): IParser<T[], E, I> {
  return {
    parse(input, context) {
      const items: T[] = [];

      let result = parser.parse(input, context);
      if (!result.ok) {
        return result;
      }

      while (result.ok) {
        items.push(result.output);
        result = parser.parse(result.input, result.context);
      }

      return {
        ok: true,
        input: result.input,
        output: items,
        context: result.context,
      };
    },
  };
}

interface ManyUntilParser<T, U, ET, EU, I extends Input>
  extends IParser<T[], ET | EU, I> {
  parser: IParser<T, ET, I>;
  end: IParser<U, EU, I>;
}
/**
 * Repeat the embedded parser until the "end" parser succeeded.
 *
 *     const result = manyUntil(digit(), alpha()).parse("123abc");
 *     result.input === "abc";
 *     result.output; // ==> ["1", "2", "3"]
 *
 * @param parser embedded parser
 * @param end end parser
 */
export function manyUntil<T, U, ET, EU, I extends Input>(
  parser: IParser<T, ET, I>,
  end: IParser<U, EU, I>,
): ManyUntilParser<T, U, ET, EU, I> {
  return {
    parser,
    end,
    parse(input, context) {
      const { parser, end } = this;
      const output: T[] = [];

      while (true) {
        const endResult = end.parse(input, context);
        if (endResult.ok) {
          return {
            ok: true,
            input,
            output,
            context,
          };
        }

        const result = parser.parse(input, context);
        if (result.ok) {
          input = result.input;
          context = result.context;
          output.push(result.output);
        } else {
          return result;
        }
      }
    },
  };
}

interface SepByParser<T, S, ET, ES, I extends Input>
  extends IParser<T[], ET | ES | MinCountError<T, ErrorKind.SepBy>, I> {
  min: number;
  max: number;
  parser: IParser<T, ET, I>;
  separator: IParser<S, ES, I>;
}
/**
 * Execute the embedded parser in specified times,
 * with another parser as separator,
 * then produce a list of values.
 *
 * If separator is trailing,
 * it will be treated as the rest of input without parsing.
 *
 *     sepBy(char(","), digit()).parse("1,2").output; // ==> ["1", "2"]
 *     sepBy(char(","), digit()).parse("1,2,").output; // ==> ["1", "2"]
 *     sepBy(char(","), digit()).parse("1,2,").input === ",";
 *     sepBy(char(","), digit(), 1).parse("").ok === false;
 *     sepBy(char(","), digit(), 0, 1).parse("1,2").output; // ==> ["1"]
 *     sepBy(char(","), digit(), 0, 1).parse("1,2").input === ",2";
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 * @param m minimum times (inclusive), default is `0`
 * @param n maximum times (inclusive), default is `Infinity`
 */
export function sepBy<T, S, ET, ES, I extends Input>(
  separator: IParser<S, ES, I>,
  parser: IParser<T, ET, I>,
  m = 0,
  n = Infinity,
): SepByParser<T, S, ET, ES, I> {
  return {
    min: Math.min(m, n),
    max: Math.max(m, n),
    parser,
    separator,
    parse(input, context) {
      const { min, max, parser, separator } = this;
      const output: T[] = [];

      let count = 0;
      let result = parser.parse(input, context);
      while (result.ok && count < max) {
        output.push(result.output);
        input = result.input;
        context = result.context;
        count += 1;

        const sep = separator.parse(input, context);
        if (!sep.ok) {
          break;
        }

        result = parser.parse(sep.input, sep.context);
      }

      if (count < min) {
        return {
          ok: false,
          input,
          error: {
            kind: ErrorKind.SepBy,
            output,
          },
          context,
        };
      } else {
        return { ok: true, input, output, context };
      }
    },
  };
}

interface SepBy1Parser<T, S, ET, ES, I extends Input>
  extends IParser<T[], ET | ES, I> {
  parser: IParser<T, ET, I>;
  separator: IParser<S, ES, I>;
}
/**
 * Execute the embedded parser at least once with another parser as separator,
 * then produce a list of values.
 *
 * If separator is trailing,
 * it will be treated as the rest of input without parsing.
 *
 *     sepBy1(char(","), digit()).parse("1,2").output; // ==> ["1", "2"]
 *     sepBy1(char(","), digit()).parse("1,2,").output; // ==> ["1", "2"]
 *     sepBy1(char(","), digit()).parse("1,2,").input === ",";
 *     sepBy1(char(","), digit()).parse("").ok === false;
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 */
export function sepBy1<T, S, ET, ES, I extends Input>(
  separator: IParser<S, ES, I>,
  parser: IParser<T, ET, I>,
): SepBy1Parser<T, S, ET, ES, I> {
  return {
    parser,
    separator,
    parse<C>(input: I, context?: C) {
      const output: T[] = [];

      let result = parser.parse(input, context);
      if (!result.ok) {
        return result;
      }

      while (result.ok) {
        output.push(result.output);
        input = result.input;
        context = result.context;

        const sep: Result<I, S, ES, C | undefined> = separator.parse(
          input,
          context,
        );
        if (!sep.ok) {
          break;
        }

        result = parser.parse(sep.input, context);
      }

      return { ok: true, input, output, context };
    },
  };
}

interface SepEndByParser<T, S, ET, ES, I extends Input>
  extends IParser<T[], ET | ES | MinCountError<T, ErrorKind.SepEndBy>, I> {
  min: number;
  max: number;
  parser: IParser<T, ET, I>;
  separator: IParser<S, ES, I>;
}
/**
 * Execute the embedded parser in specified times,
 * with another parser as separator,
 * then produce a list of values.
 * Separator can be trailing.
 *
 *     sepEndBy(char(","), digit()).parse("1,2").output; // ==> ["1", "2"]
 *     sepEndBy(char(","), digit()).parse("1,2,").output; // ==> ["1", "2"]
 *     sepEndBy(char(","), digit()).parse("1,2,").input === "";
 *     sepEndBy(char(","), digit(), 1).parse("").ok === false;
 *     sepEndBy(char(","), digit(), 0, 1).parse("1,2").output; // ==> ["1"]
 *     sepEndBy(char(","), digit(), 0, 1).parse("1,2").input === "2";
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 * @param m minimum times (inclusive), default is `0`
 * @param n maximum times (inclusive), default is `Infinity`
 */
export function sepEndBy<T, S, ET, ES, I extends Input>(
  separator: IParser<S, ES, I>,
  parser: IParser<T, ET, I>,
  m = 0,
  n = Infinity,
): SepEndByParser<T, S, ET, ES, I> {
  return {
    min: Math.min(m, n),
    max: Math.max(m, n),
    parser,
    separator,
    parse(input, context) {
      const { min, max, parser, separator } = this;
      const output: T[] = [];

      let count = 0;
      let result = parser.parse(input, context);
      while (result.ok && count < max) {
        output.push(result.output);
        input = result.input;
        context = result.context;
        count += 1;

        const sep = separator.parse(input, context);
        input = sep.input;
        context = sep.context;
        if (!sep.ok) {
          break;
        }

        result = parser.parse(input, context);
      }

      if (count < min) {
        return {
          ok: false,
          input,
          error: {
            kind: ErrorKind.SepEndBy,
            output,
          },
          context,
        };
      } else {
        return { ok: true, input, output, context };
      }
    },
  };
}

type SepEndBy1Parser<T, S, ET, ES, I extends Input> = SepBy1Parser<
  T,
  S,
  ET,
  ES,
  I
>;
/**
 * Execute the embedded parser at least once with another parser as separator,
 * then produce a list of values.
 * Separator can be trailing.
 *
 *     sepEndBy1(char(","), digit()).parse("1,2").output; // ==> ["1", "2"]
 *     sepEndBy1(char(","), digit()).parse("1,2,").output; // ==> ["1", "2"]
 *     sepEndBy1(char(","), digit()).parse("1,2,").input === "";
 *     sepEndBy1(char(","), digit()).parse("").ok === false;
 *
 * @param separator parser to parse as separator
 * @param parser embedded parser
 */
export function sepEndBy1<T, S, ET, ES, I extends Input>(
  separator: IParser<S, ES, I>,
  parser: IParser<T, ET, I>,
): SepEndBy1Parser<T, S, ET, ES, I> {
  return {
    parser,
    separator,
    parse<C>(input: I, context?: C) {
      const output: T[] = [];

      let result = parser.parse(input, context);
      if (!result.ok) {
        return result;
      }

      while (result.ok) {
        output.push(result.output);
        input = result.input;
        context = result.context;

        const sep: Result<I, S, ES, C | undefined> = separator.parse(
          input,
          context,
        );
        input = sep.input;
        context = sep.context;
        if (!sep.ok) {
          break;
        }

        result = parser.parse(sep.input, context);
      }

      return { ok: true, input, output, context };
    },
  };
}
