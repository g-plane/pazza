import type { IParser, Input } from "./core.ts";

interface LazyParser<O, E, I extends Input> extends IParser<O, E, I> {
  fn: () => IParser<O, E, I>;
  parser: IParser<O, E, I> | null;
}
/**
 * Construct a parser only when it's needed.
 * This is useful when building a recursive parser.
 *
 *     // We don't call the `parse` method,
 *     // so the `recursiveParser` won't be constructed.
 *     lazy(() => recursiveParser());
 *
 * @param fn Function that returns a parser.
 */
export function lazy<O, E, I extends Input>(
  fn: () => IParser<O, E, I>,
): LazyParser<O, E, I> {
  return {
    fn,
    parser: null,
    parse(input, context) {
      this.parser ??= this.fn();

      return this.parser.parse(input, context);
    },
  };
}
