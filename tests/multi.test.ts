import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  many,
  many0,
  many1,
  manyUntil,
  sepBy,
  sepBy1,
  sepEndBy,
  sepEndBy1,
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
    context: undefined,
  });

  assertEquals(parser.parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(parser.parse("123"), {
    ok: true,
    input: "",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("1234"), {
    ok: true,
    input: "4",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(many(digit(), 0, Infinity).parse(""), {
    ok: true,
    input: "",
    output: [],
    context: undefined,
  });

  assertEquals(many(digit(), 0, Infinity).parse("1234"), {
    ok: true,
    input: "",
    output: ["1", "2", "3", "4"],
    context: undefined,
  });

  assertEquals(many(digit(), 2, 2).parse("1"), {
    ok: false,
    input: "",
    error: {
      kind: ErrorKind.Many,
      output: ["1"],
    },
    context: undefined,
  });

  assertEquals(many(digit(), 2, 2).parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(many(digit(), 2, 2).parse("123"), {
    ok: true,
    input: "3",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(many(digit(), 3, 2).parse("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
    context: undefined,
  });
});

Deno.test("many0", () => {
  const parser = many0(digit());

  assertEquals(parser.parse("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("a"), {
    ok: true,
    input: "a",
    output: [],
    context: undefined,
  });
});

Deno.test("many1", () => {
  const parser = many1(digit());

  assertEquals(parser.parse("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("a"), digit().parse("a"));
});

Deno.test("manyUntil", () => {
  const parser = manyUntil(digit(), char("."));

  assertEquals(parser.parse("."), {
    ok: true,
    input: ".",
    output: [],
    context: undefined,
  });

  assertEquals(parser.parse("123.abc"), {
    ok: true,
    input: ".abc",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("123abc.abc"), {
    ok: false,
    input: "abc.abc",
    error: ErrorKind.Digit,
    context: undefined,
  });
});

Deno.test("sepBy", () => {
  assertEquals(sepBy(char(","), digit()).parse("a"), {
    ok: true,
    input: "a",
    output: [],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit()).parse("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit()).parse("1,a"), {
    ok: true,
    input: ",a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit()).parse("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 2).parse("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 2).parse("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 2).parse("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepBy,
      output: ["1"],
    },
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 2).parse("1,a"), {
    ok: false,
    input: ",a",
    error: {
      kind: ErrorKind.SepBy,
      output: ["1"],
    },
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 1, 2).parse("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepBy(char(","), digit(), 1, 2).parse("1,2,3a"), {
    ok: true,
    input: ",3a",
    output: ["1", "2"],
    context: undefined,
  });
});

Deno.test("sepBy1", () => {
  const parser = sepBy1(char(","), digit());

  assertEquals(parser.parse("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(parser.parse("1,a"), {
    ok: true,
    input: ",a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(parser.parse("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: undefined,
  });
});

Deno.test("sepEndBy", () => {
  assertEquals(sepEndBy(char(","), digit()).parse("a"), {
    ok: true,
    input: "a",
    output: [],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit()).parse(",a"), {
    ok: true,
    input: ",a",
    output: [],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit()).parse("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit()).parse("1,a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit()).parse("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1,2,a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1,2,3,a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepEndBy,
      output: ["1"],
    },
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 2).parse("1,a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepEndBy,
      output: ["1"],
    },
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 1, 2).parse("1,2,a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: undefined,
  });

  assertEquals(sepEndBy(char(","), digit(), 1, 2).parse("1,2,3a"), {
    ok: true,
    input: "3a",
    output: ["1", "2"],
    context: undefined,
  });
});

Deno.test("sepEndBy1", () => {
  const parser = sepEndBy1(char(","), digit());

  assertEquals(parser.parse("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(parser.parse("1,a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: undefined,
  });

  assertEquals(parser.parse("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("1,2,3,a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: undefined,
  });

  assertEquals(parser.parse("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: undefined,
  });

  assertEquals(parser.parse(",a"), {
    ok: false,
    input: ",a",
    error: ErrorKind.Digit,
    context: undefined,
  });
});
