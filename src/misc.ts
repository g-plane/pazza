import type { IParser, Input } from "./core.ts";

interface LazyParser<O, E, I extends Input> extends IParser<O, E, I> {
  fn: () => IParser<O, E, I>;
  parser: IParser<O, E, I> | null;
}
export function lazy<O, E, I extends Input>(
  fn: () => IParser<O, E, I>,
): LazyParser<O, E, I> {
  return {
    fn,
    parser: null,
    parse(input) {
      this.parser ??= this.fn();

      return this.parser.parse(input);
    },
  };
}
