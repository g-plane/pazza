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
