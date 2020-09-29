import type { IParser, Result } from "./core.ts";
import { ErrorKind } from "./error.ts";

/**
 * Parse a specified byte.
 *
 *     byte(10)(Uint8Array.of(10)).output === 10;
 *     byte(10)(Uint8Array.of(11)).ok === false;
 *
 * @param byte 8-bit unsigned integer
 */
export function byte<B extends number>(
  byte: B,
): IParser<B, ErrorKind.Byte, Uint8Array> {
  function parse<C>(
    input: Uint8Array,
    context: C = Object.create(null),
  ): Result<Uint8Array, B, ErrorKind.Byte, C> {
    if (input[0] === parse.byte) {
      return {
        ok: true,
        input: input.subarray(1),
        output: parse.byte,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Byte,
        context,
      };
    }
  }
  parse.byte = byte;

  return parse;
}

/**
 * Parse any single byte.
 *
 *     anyByte()(Uint8Array.of(10)).output === 10;
 */
export function anyByte(): IParser<number, ErrorKind.AnyByte, Uint8Array> {
  return <C>(
    input: Uint8Array,
    context: C = Object.create(null),
  ): Result<Uint8Array, number, ErrorKind.AnyByte, C> => {
    if (input.length === 0) {
      return {
        ok: false,
        input,
        error: ErrorKind.AnyByte,
        context,
      };
    } else {
      return {
        ok: true,
        input: input.subarray(1),
        output: input[0],
        context,
      };
    }
  };
}

/**
 * Parse a specified slice of bytes.
 *
 *     const parser = slice(Uint8Array.of(13, 10));
 *     parser(Uint8Array.of(13, 10)).output; // ==> Uint8Array [13, 10]
 *     parser(Uint8Array.of(13, 13)).ok === false;
 *
 * @param slice slice of 8-bit unsigned integers
 */
export function slice(
  slice: Uint8Array,
): IParser<Uint8Array, ErrorKind.Slice, Uint8Array> {
  function parse<C>(
    input: Uint8Array,
    context: C = Object.create(null),
  ): Result<Uint8Array, Uint8Array, ErrorKind.Slice, C> {
    const { slice } = parse;
    const max = slice.length;
    for (let i = 0; i < max; i += 1) {
      if (slice[i] !== input[i]) {
        return {
          ok: false,
          input,
          error: ErrorKind.Slice,
          context,
        };
      }
    }

    return {
      ok: true,
      input: input.slice(max),
      output: slice,
      context,
    };
  }
  parse.slice = slice;

  return parse;
}
