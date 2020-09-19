import type { IParser } from "./core.ts";
import { ErrorKind } from "./error.ts";

interface ByteParser<B extends number>
  extends IParser<B, ErrorKind.Byte, Uint8Array> {
  byte: B;
}
/**
 * Parse a specified byte.
 *
 *     byte(10).parse(Uint8Array.of(10)).output === 10;
 *
 * @param byte 8-bit unsigned integer
 */
export function byte<B extends number>(byte: B): ByteParser<B> {
  return {
    byte,
    parse(input) {
      const { byte } = this;
      if (input[0] === byte) {
        return {
          ok: true,
          input: input.subarray(1),
          output: byte,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Byte,
        };
      }
    },
  };
}

/**
 * Parse any single byte.
 *
 *     anyByte().parse(Uint8Array.of(10)).output === 10;
 */
export function anyByte(): IParser<number, ErrorKind.AnyByte, Uint8Array> {
  return {
    parse(input) {
      if (input.length === 0) {
        return {
          ok: false,
          input,
          error: ErrorKind.AnyByte,
        };
      } else {
        return {
          ok: true,
          input: input.subarray(1),
          output: input[0],
        };
      }
    },
  };
}

interface SliceParser extends IParser<Uint8Array, ErrorKind.Slice, Uint8Array> {
  slice: Uint8Array;
}
/**
 * Parse a specified slice of bytes.
 *
 *     const parser = slice(Uint8Array.of(13, 10));
 *     parser.parse(Uint8Array.of(13, 10)).output; // ==> Uint8Array [13, 10]
 *     parser.parse(Uint8Array.of(13, 13)).ok === false;
 *
 * @param slice slice of 8-bit unsigned integers
 */
export function slice(slice: Uint8Array): SliceParser {
  return {
    slice,
    parse(input) {
      const { slice } = this;
      const max = slice.length;
      for (let i = 0; i < max; i += 1) {
        if (slice[i] !== input[i]) {
          return {
            ok: false,
            input,
            error: ErrorKind.Slice,
          };
        }
      }

      return {
        ok: true,
        input: input.slice(max),
        output: slice,
      };
    },
  };
}
