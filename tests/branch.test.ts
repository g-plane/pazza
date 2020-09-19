import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass, fail } from "./_.ts";
import { or, choice, digit, alpha, map, ErrorKind } from "../mod.ts";

Deno.test("or", () => {
  assertEquals(or(pass(1), pass(2)).parse(""), {
    ok: true,
    input: "",
    output: 1,
  });

  assertEquals(or(pass(1), fail()).parse(""), {
    ok: true,
    input: "",
    output: 1,
  });

  assertEquals(or(fail(), pass(2)).parse(""), {
    ok: true,
    input: "",
    output: 2,
  });

  assertEquals(or(fail(), fail()).parse(""), {
    ok: false,
    input: "",
    error: "Fake parsing error.",
  });
});

Deno.test("choice", () => {
  const parser = choice(digit(), alpha());

  assertEquals(parser.parse("1a"), {
    ok: true,
    input: "a",
    output: "1",
  });

  assertEquals(parser.parse("a1"), {
    ok: true,
    input: "1",
    output: "a",
  });

  assertEquals(parser.parse("-1a"), {
    ok: false,
    input: "-1a",
    error: ErrorKind.Alphabet,
  });

  assertEquals(choice(alpha(), map(digit(), Number.parseInt)).parse("5"), {
    ok: true,
    input: "",
    output: 5,
  });
});
