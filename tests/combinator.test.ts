import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass, fail } from "./_.ts";
import { map, mapErr, optional, satisfy } from "../mod.ts";
import { ErrorKind } from "../src/error.ts";

Deno.test("map", () => {
  assertEquals(map(pass(10), (num) => num + 1).parse(""), {
    ok: true,
    input: "",
    output: 11,
  });

  assertEquals(map(fail<number>(), (num) => num + 1).parse(""), {
    ok: false,
    input: "",
    error: "Fake parsing error.",
  });
});

Deno.test("mapErr", () => {
  assertEquals(mapErr(pass(10), (err) => `Error: ${err}`).parse(""), {
    ok: true,
    input: "",
    output: 10,
  });

  assertEquals(mapErr(fail<number>(), (err) => `Error: ${err}`).parse(""), {
    ok: false,
    input: "",
    error: "Error: Fake parsing error.",
  });
});

Deno.test("optional", () => {
  assertEquals(optional(pass("test")).parse(""), {
    ok: true,
    input: "",
    output: "test",
  });

  assertEquals(optional(fail()).parse(""), {
    ok: true,
    input: "",
    output: null,
  });
});

Deno.test("satisfy", () => {
  assertEquals(satisfy((item) => item === "a").parse("ab"), {
    ok: true,
    input: "b",
    output: "a",
  });

  assertEquals(satisfy((item) => item === "a").parse("ba"), {
    ok: false,
    input: "ba",
    error: ErrorKind.Satisfy,
  });

  assertEquals(
    satisfy((item: number) => item === 13).parse(Uint8Array.of(13, 10)),
    {
      ok: true,
      input: Uint8Array.of(10),
      output: 13,
    },
  );

  assertEquals(satisfy((item: number) => item === 13).parse(Uint8Array.of(8)), {
    ok: false,
    input: Uint8Array.of(8),
    error: ErrorKind.Satisfy,
  });
});
