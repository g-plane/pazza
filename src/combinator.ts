import type { IParser, Input } from "./core.ts";
import { ErrorKind } from "./error.ts";

/**
 * Execute the embedded parser.
 * If it succeeds, apply provided function on the output.
 *
 *     const parser = map(digit(), value => Number.parseInt(value));
 *     parser.parse("5").output === 5;
 *
 * @param parser embededd parser
 * @param fn function to be applied on successful output
 */
export function map<T, U, E, I extends Input>(
  parser: IParser<T, E, I>,
  fn: (arg: T) => U,
): IParser<U, E, I> {
  return {
    parse(input) {
      const result = parser.parse(input);
      if (result.ok) {
        return { ...result, output: fn(result.output) };
      } else {
        return result;
      }
    },
  };
}

/**
 * Execute the embedded parser.
 * If it fails, apply provided function on the error.
 *
 *     const parser = map(digit(), error => "Not a digit.");
 *     parser.parse("a").error === "Not a digit.";
 *
 * @param parser embededd parser
 * @param fn function to be applied on error
 */
export function mapErr<T, E1, E2, I extends Input>(
  parser: IParser<T, E1, I>,
  fn: (error: E1) => E2,
): IParser<T, E2, I> {
  return {
    parse(input) {
      const result = parser.parse(input);
      if (result.ok) {
        return result;
      } else {
        return { ...result, error: fn(result.error) };
      }
    },
  };
}

/**
 * Execute the embedded parser.
 * If it succeeds, return its value.
 * If it fails, return `null` with a successful result.
 *
 *     const result = optional(digit()).parse("a");
 *     result.ok === true;
 *     result.output === null;
 *
 * @param parser embedded parser
 */
export function optional<T, I extends Input>(
  parser: IParser<T, unknown, I>,
): IParser<T | null, never, I> {
  return {
    parse(input) {
      const result = parser.parse(input);
      if (result.ok) {
        return result;
      } else {
        return {
          ok: true,
          input,
          output: null,
        };
      }
    },
  };
}

export function skip<T, EP, EO, I extends Input>(
  parser: IParser<T, EP, I>,
  omit: IParser<unknown, EO, I>,
): IParser<T, EP | EO, I> {
  return {
    parse(input) {
      const result = parser.parse(input);
      if (!result.ok) {
        return result;
      }

      const skipped = omit.parse(result.input);
      if (!skipped.ok) {
        return skipped;
      }

      return { ...result, input: skipped.input };
    },
  };
}

/**
 * Pick next character from input and pass it to provided predicate.
 * If the predicate passes, return a successful parsing result with that character.
 * If not, return a parsing error.
 *
 *     satisfy((char) => char === "a").parse("a").output === "a";
 *     satisfy((char) => char === "a").parse("b").ok === false;
 *
 * @param predicate predicate which tests next character
 */
export function satisfy<P extends (item: string) => boolean>(
  predicate: P,
): IParser<string, ErrorKind.Satisfy, string> & { predicate: P };
/**
 * Pick next byte from input and pass it to provided predicate.
 * If the predicate passes, return a successful parsing result with that byte.
 * If not, return a parsing error.
 *
 *     satisfy((byte) => byte === 10).parse(Uint8Array.of(10)).output === 10;
 *     satisfy((byte) => byte === 10).parse(Uint8Array.of(13)).ok === false;
 *
 * @param predicate predicate which tests next byte (8-bit unsigned integer)
 */
export function satisfy<P extends (item: number) => boolean>(
  predicate: P,
): IParser<number, ErrorKind.Satisfy, Uint8Array> & { predicate: P };
export function satisfy(
  predicate: (item: string | number) => boolean,
): IParser<string | number, ErrorKind.Satisfy, Input> & {
  predicate(item: string | number): boolean;
} {
  return {
    predicate,
    parse(input) {
      const first = input[0];

      if (this.predicate(first)) {
        return {
          ok: true,
          input: input.slice(1),
          output: first,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Satisfy,
        };
      }
    },
  };
}
