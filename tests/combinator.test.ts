import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass, fail } from "./_.ts";
import { map, mapErr, optional, satisfy } from "../mod.ts";
import { ErrorKind } from "../src/error.ts";

Deno.test("map", () => {
  assertEquals(map(pass(10), (num) => num + 1)(""), {
    ok: true,
    input: "",
    output: 11,
    context: {},
  });

  assertEquals(map(fail<number>(), (num) => num + 1)(""), {
    ok: false,
    input: "",
    error: "Fake parsing error.",
    context: {},
  });
});

Deno.test("mapErr", () => {
  assertEquals(mapErr(pass(10), (err) => `Error: ${err}`)(""), {
    ok: true,
    input: "",
    output: 10,
    context: {},
  });

  assertEquals(mapErr(fail<number>(), (err) => `Error: ${err}`)(""), {
    ok: false,
    input: "",
    error: "Error: Fake parsing error.",
    context: {},
  });
});

Deno.test("optional", () => {
  assertEquals(optional(pass("test"))(""), {
    ok: true,
    input: "",
    output: "test",
    context: {},
  });

  assertEquals(optional(fail())(""), {
    ok: true,
    input: "",
    output: null,
    context: {},
  });
});

Deno.test("satisfy", () => {
  assertEquals(satisfy((item) => item === "a")("ab"), {
    ok: true,
    input: "b",
    output: "a",
    context: {},
  });

  assertEquals(satisfy((item) => item === "a")("ba"), {
    ok: false,
    input: "ba",
    error: ErrorKind.Satisfy,
    context: {},
  });

  assertEquals(
    satisfy((item: number) => item === 13)(Uint8Array.of(13, 10)),
    {
      ok: true,
      input: Uint8Array.of(10),
      output: 13,
      context: {},
    },
  );

  assertEquals(satisfy((item: number) => item === 13)(Uint8Array.of(8)), {
    ok: false,
    input: Uint8Array.of(8),
    error: ErrorKind.Satisfy,
    context: {},
  });
});
