import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { byte, anyByte, slice, ErrorKind } from "../mod.ts";

Deno.test("byte", () => {
  const bytes = Uint8Array.of(13, 10);

  assertEquals(byte(13)(bytes), {
    ok: true,
    input: bytes.subarray(1),
    output: 13,
    context: {},
  });

  assertEquals(byte(10)(bytes), {
    ok: false,
    input: bytes,
    error: ErrorKind.Byte,
    context: {},
  });
});

Deno.test("anyByte", () => {
  assertEquals(anyByte()(Uint8Array.of(13, 10)), {
    ok: true,
    input: Uint8Array.of(10),
    output: 13,
    context: {},
  });

  assertEquals(anyByte()(Uint8Array.of()), {
    ok: false,
    input: Uint8Array.of(),
    error: ErrorKind.AnyByte,
    context: {},
  });
});

Deno.test("slice", () => {
  const bytes = Uint8Array.of(65, 66, 67);

  assertEquals(slice(Uint8Array.of(65, 66))(bytes), {
    ok: true,
    input: bytes.subarray(2),
    output: bytes.subarray(0, 2),
    context: {},
  });

  assertEquals(slice(Uint8Array.of(64, 65))(bytes), {
    ok: false,
    input: bytes,
    error: ErrorKind.Slice,
    context: {},
  });
});
