import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { string, string0, string1, digit, ErrorKind } from "../mod.ts";

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

Deno.test("string0", () => {
  const parser = string0(digit());

  assertEquals(parser("123abc"), {
    ok: true,
    input: "abc",
    output: "123",
    context: {},
  });

  assertEquals(parser("a"), {
    ok: true,
    input: "a",
    output: "",
    context: {},
  });

  assertEquals(parser(""), {
    ok: true,
    input: "",
    output: "",
    context: {},
  });
});

Deno.test("string1", () => {
  const parser = string1(digit());

  assertEquals(parser("123abc"), {
    ok: true,
    input: "abc",
    output: "123",
    context: {},
  });

  assertEquals(parser("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: {},
  });

  assertEquals(parser(""), {
    ok: false,
    input: "",
    error: ErrorKind.Digit,
    context: {},
  });
});
