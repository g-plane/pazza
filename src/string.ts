import type { IParser, Result } from "./core.ts";
import { ErrorKind } from "./error.ts";

/**
 * Parse a specified string.
 *
 *     const parser = string("ab");
 *     parser("ab").output === "ab";
 *     parser("ac").ok === false;
 *
 * @param literal string literal
 */
export function string<S extends string>(
  literal: S,
): IParser<S, ErrorKind.String, string> {
  function parse<C, I extends string>(
    input: I,
    context: C = Object.create(null),
  ): Result<string, S, ErrorKind.String, C> {
    const { literal } = parse;
    if (input.slice(0, literal.length) === literal) {
      return {
        ok: true,
        input: input.slice(literal.length),
        output: literal,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.String,
        context,
      };
    }
  }
  parse.literal = literal;

  return parse;
}
