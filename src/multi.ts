import type { IParser, Input } from "./core.ts";
import { ErrorKind } from "./error.ts";

interface ManyMinError<T> {
  kind: ErrorKind.Many;
  output: T[];
}
interface ManyParser<T, E, I extends Input>
  extends IParser<T[], E | ManyMinError<T>, I> {
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
    parse(input) {
      const { min, max } = this;

      const output: T[] = [];
      let count = 0;

      let result = parser.parse(input);
      while (result.ok && count < max) {
        count += 1;
        output.push(result.output);
        input = result.input;
        result = parser.parse(input);
      }

      if (count < min) {
        return {
          ok: false,
          input,
          error: { kind: ErrorKind.Many, output },
        };
      } else {
        return {
          ok: true,
          input,
          output,
        };
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
    parse(input) {
      const items: T[] = [];

      let result = parser.parse(input);
      while (result.ok) {
        items.push(result.output);
        input = result.input;
        result = parser.parse(input);
      }

      return {
        ok: true,
        input,
        output: items,
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
    parse(input) {
      const items: T[] = [];

      let result = parser.parse(input);
      if (!result.ok) {
        return result;
      }

      while (result.ok) {
        items.push(result.output);
        input = result.input;
        result = parser.parse(input);
      }

      return {
        ok: true,
        input,
        output: items,
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
    parse(input) {
      const { parser, end } = this;
      const output: T[] = [];

      while (true) {
        const endResult = end.parse(input);
        if (endResult.ok) {
          return {
            ok: true,
            input,
            output,
          };
        }

        const result = parser.parse(input);
        if (result.ok) {
          input = result.input;
          output.push(result.output);
        } else {
          return result;
        }
      }
    },
  };
}

export function sepBy<T, S, ET, ES, I extends Input>(
  separator: IParser<S, ES, I>,
  parser: IParser<T, ET, I>,
): IParser<T[], ET | ES, I> {
  return {
    parse(input) {
      const items: T[] = [];

      let result = parser.parse(input);
      if (!result.ok) {
        return result;
      }

      while (result.ok) {
        items.push(result.output);
        input = result.input;

        const sep = separator.parse(input);
        if (!sep.ok) {
          return {
            ok: true,
            input: sep.input,
            output: items,
          };
        }

        result = parser.parse(sep.input);
      }

      return result;
    },
  };
}
