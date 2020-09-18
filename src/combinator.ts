import type { IParser, Input } from "./core.ts";
import { ErrorKind } from "./error.ts";

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

export function satisfy<P extends (item: string) => boolean>(
  predicate: P,
): IParser<string, ErrorKind.Satisfy, string> & { predicate: P };
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
