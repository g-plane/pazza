import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import { byte, anyByte, slice, ErrorKind } from "../mod.ts";

Deno.test("byte", () => {
  const bytes = Uint8Array.of(13, 10);

  assertEquals(byte(13).parse(bytes), {
    ok: true,
    input: bytes.subarray(1),
    output: 13,
  });

  assertEquals(byte(10).parse(bytes), {
    ok: false,
    input: bytes,
    error: ErrorKind.Byte,
  });
});

Deno.test("anyByte", () => {
  assertEquals(anyByte().parse(Uint8Array.of(13, 10)), {
    ok: true,
    input: Uint8Array.of(10),
    output: 13,
  });

  assertEquals(anyByte().parse(Uint8Array.of()), {
    ok: false,
    input: Uint8Array.of(),
    error: ErrorKind.AnyByte,
  });
});

Deno.test("slice", () => {
  const bytes = Uint8Array.of(65, 66, 67);

  assertEquals(slice(Uint8Array.of(65, 66)).parse(bytes), {
    ok: true,
    input: bytes.subarray(2),
    output: bytes.subarray(0, 2),
  });

  assertEquals(slice(Uint8Array.of(64, 65)).parse(bytes), {
    ok: false,
    input: bytes,
    error: ErrorKind.Slice,
  });
});
