import type { IParser, Input } from "./core.ts";

export function or<L, R, EL, ER, I extends Input>(
  left: IParser<L, EL, I>,
  right: IParser<R, ER, I>,
): IParser<L | R, EL | ER, I> {
  return {
    parse(input) {
      const result = left.parse(input);
      if (result.ok) {
        return result;
      } else {
        return right.parse(input);
      }
    },
  };
}

export function choice<
  I extends Input,
  P extends readonly IParser<unknown, unknown, I>[],
>(...parsers: P): P[number] & { parsers: P } {
  return {
    parsers,
    parse(input) {
      const { parsers } = this;
      const lastIndex = parsers.length - 1;
      for (let i = 0; i < lastIndex; i += 1) {
        const result = parsers[i].parse(input);
        if (result.ok) {
          return result;
        }
      }

      return parsers[lastIndex].parse(input);
    },
  };
}
