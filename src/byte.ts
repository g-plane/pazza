import type { IParser } from "./core.ts";
import { ErrorKind } from "./error.ts";

interface ByteParser<B extends number>
  extends IParser<B, ErrorKind.Byte, Uint8Array> {
  byte: B;
}
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
