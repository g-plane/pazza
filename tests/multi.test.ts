import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  many,
  many0,
  many1,
  manyUntil,
  sepBy,
  digit,
  char,
  ErrorKind,
} from "../mod.ts";

Deno.test("many", () => {
  const parser = many(digit(), 2, 3);

  assertEquals(parser.parse("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.Many,
      output: ["1"],
    },
  });

  assertEquals(parser.parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
  });

  assertEquals(parser.parse("123"), {
    ok: true,
    input: "",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("1234"), {
    ok: true,
    input: "4",
    output: ["1", "2", "3"],
  });

  assertEquals(many(digit(), 0, Infinity).parse(""), {
    ok: true,
    input: "",
    output: [],
  });

  assertEquals(many(digit(), 0, Infinity).parse("1234"), {
    ok: true,
    input: "",
    output: ["1", "2", "3", "4"],
  });

  assertEquals(many(digit(), 2, 2).parse("1"), {
    ok: false,
    input: "",
    error: {
      kind: ErrorKind.Many,
      output: ["1"],
    },
  });

  assertEquals(many(digit(), 2, 2).parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
  });

  assertEquals(many(digit(), 2, 2).parse("123"), {
    ok: true,
    input: "3",
    output: ["1", "2"],
  });

  assertEquals(many(digit(), 3, 2).parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
  });
});

Deno.test("many0", () => {
  const parser = many0(digit());

  assertEquals(parser.parse("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("a"), {
    ok: true,
    input: "a",
    output: [],
  });
});

Deno.test("many1", () => {
  const parser = many1(digit());

  assertEquals(parser.parse("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("a"), digit().parse("a"));
});

Deno.test("manyUntil", () => {
  const parser = manyUntil(digit(), char("."));

  assertEquals(parser.parse("."), {
    ok: true,
    input: ".",
    output: [],
  });

  assertEquals(parser.parse("123.abc"), {
    ok: true,
    input: ".abc",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("123abc.abc"), {
    ok: false,
    input: "abc.abc",
    error: ErrorKind.Digit,
  });
});

Deno.test("sepBy", () => {
  const parser = sepBy(char(","), digit());

  assertEquals(parser.parse("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
  });

  assertEquals(parser.parse("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("a"), digit().parse("a"));
});
