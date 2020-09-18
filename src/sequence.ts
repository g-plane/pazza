import type { IParser, Input } from "./core.ts";

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

export function serial<
  P extends IParser<unknown, unknown, string>[],
>(...parsers: P):
  & IParser<
    {
      [K in keyof P]: P[K] extends IParser<infer O, infer _, string> ? O
        : never;
    },
    P[number] extends IParser<infer _, infer E, string> ? E : never,
    string
  >
  & { parsers: P };
export function serial<
  P extends IParser<unknown, unknown, Uint8Array>[],
>(...parsers: P):
  & IParser<
    {
      [K in keyof P]: P[K] extends IParser<infer O, infer _, Uint8Array> ? O
        : never;
    },
    P[number] extends IParser<infer _, infer E, Uint8Array> ? E : never,
    Uint8Array
  >
  & { parsers: P };
export function serial<
  I extends Input,
  P extends IParser<unknown, unknown, I>[],
>(...parsers: P):
  & IParser<
    { [K in keyof P]: P[K] extends IParser<infer O, infer _, I> ? O : never },
    P[number] extends IParser<infer _, infer E, I> ? E : never,
    I
  >
  & { parsers: P } {
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
            error: P[number] extends IParser<infer _, infer E, I> ? E : never;
          };
        }

        input = result.input;
        output.push(result.output);
      }

      return {
        ok: true,
        input,
        output: output as {
          [K in keyof P]: P[K] extends IParser<infer O, infer _, I> ? O : never;
        },
      };
    },
  };
}
