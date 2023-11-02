import type { IParser, Input, Result } from './core.js'

/**
 * Construct a parser only when it's needed.
 * This is useful when building a recursive parser.
 *
 *     // We don't call the parser,
 *     // so the `recursiveParser` won't be constructed.
 *     lazy(() => recursiveParser());
 *
 * @param fn Function that returns a parser.
 */
export function lazy<O, E, I extends Input>(
  fn: () => IParser<O, E, I>,
): IParser<O, E, I> {
  function parse<C>(
    input: I,
    context: C = Object.create(null),
  ): Result<I, O, E, C> {
    parse.parser ??= parse.fn()

    return parse.parser(input, context)
  }
  parse.fn = fn
  parse.parser = null as IParser<O, E, I> | null

  return parse
}
