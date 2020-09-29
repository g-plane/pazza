import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass, fail } from "./_.ts";
import { or, choice, digit, alpha, map, ErrorKind } from "../mod.ts";

Deno.test("or", () => {
  assertEquals(or(pass(1), pass(2))(""), {
    ok: true,
    input: "",
    output: 1,
    context: {},
  });

  assertEquals(or(pass(1), fail())(""), {
    ok: true,
    input: "",
    output: 1,
    context: {},
  });

  assertEquals(or(fail(), pass(2))(""), {
    ok: true,
    input: "",
    output: 2,
    context: {},
  });

  assertEquals(or(fail(), fail())(""), {
    ok: false,
    input: "",
    error: "Fake parsing error.",
    context: {},
  });
});

Deno.test("choice", () => {
  const parser = choice(digit(), alpha());

  assertEquals(parser("1a"), {
    ok: true,
    input: "a",
    output: "1",
    context: {},
  });

  assertEquals(parser("a1"), {
    ok: true,
    input: "1",
    output: "a",
    context: {},
  });

  assertEquals(parser("-1a"), {
    ok: false,
    input: "-1a",
    error: ErrorKind.Alphabet,
    context: {},
  });

  assertEquals(choice(alpha(), map(digit(), Number.parseInt))("5"), {
    ok: true,
    input: "",
    output: 5,
    context: {},
  });
});
