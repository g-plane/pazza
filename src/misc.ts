import type { IParser, Input } from "./core.ts";

interface LazyParser<O, E, I extends Input> extends IParser<O, E, I> {
  fn: () => IParser<O, E, I>;
}
export function lazy<O, E, I extends Input>(
  fn: () => IParser<O, E, I>,
): LazyParser<O, E, I> {
  return {
    fn,
    parse(input) {
      const { fn } = this;

      return fn().parse(input);
    },
  };
}
