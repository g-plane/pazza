import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { string, ErrorKind } from "../mod.ts";

Deno.test("string", () => {
  assertEquals(string("str")("string"), {
    ok: true,
    input: "ing",
    output: "str",
    context: {},
  });

  assertEquals(string("str")(""), {
    ok: false,
    input: "",
    error: ErrorKind.String,
    context: {},
  });
});
