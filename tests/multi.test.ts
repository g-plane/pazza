import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.70.0/testing/asserts.ts";
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

  assertEquals(parser("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.Many,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(parser("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(parser("123"), {
    ok: true,
    input: "",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("1234"), {
    ok: true,
    input: "4",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(many(digit(), 0, Infinity)(""), {
    ok: true,
    input: "",
    output: [],
    context: {},
  });

  assertEquals(many(digit(), 0, Infinity)("1234"), {
    ok: true,
    input: "",
    output: ["1", "2", "3", "4"],
    context: {},
  });

  assertEquals(many(digit(), 2, 2)("1"), {
    ok: false,
    input: "",
    error: {
      kind: ErrorKind.Many,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(many(digit(), 2, 2)("12"), {
    ok: true,
    input: "",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(many(digit(), 2, 2)("123"), {
    ok: true,
    input: "3",
    output: ["1", "2"],
    context: {},
  });

  assertThrows(
    () => many(digit(), 3, 2),
    RangeError,
    "Maximum value must be greater than minimum value.",
  );
});

Deno.test("many0", () => {
  const parser = many0(digit());

  assertEquals(parser("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("a"), {
    ok: true,
    input: "a",
    output: [],
    context: {},
  });
});

Deno.test("many1", () => {
  const parser = many1(digit());

  assertEquals(parser("123a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("a"), digit()("a"));
});

Deno.test("manyUntil", () => {
  const parser = manyUntil(digit(), char("."));

  assertEquals(parser("."), {
    ok: true,
    input: ".",
    output: [],
    context: {},
  });

  assertEquals(parser("123.abc"), {
    ok: true,
    input: ".abc",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("123abc.abc"), {
    ok: false,
    input: "abc.abc",
    error: ErrorKind.Digit,
    context: {},
  });
});

Deno.test("sepBy", () => {
  assertEquals(sepBy(char(","), digit())("a"), {
    ok: true,
    input: "a",
    output: [],
    context: {},
  });

  assertEquals(sepBy(char(","), digit())("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit())("1,a"), {
    ok: true,
    input: ",a",
    output: ["1"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit())("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 2)("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 2)("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 2)("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepBy,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 2)("1,a"), {
    ok: false,
    input: ",a",
    error: {
      kind: ErrorKind.SepBy,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 1, 2)("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepBy(char(","), digit(), 1, 2)("1,2,3a"), {
    ok: true,
    input: ",3a",
    output: ["1", "2"],
    context: {},
  });

  assertThrows(
    () => sepBy(char(","), digit(), 3, 2),
    RangeError,
    "Maximum value must be greater than minimum value.",
  );
});

Deno.test("sepBy1", () => {
  const parser = sepBy1(char(","), digit());

  assertEquals(parser("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(parser("1,a"), {
    ok: true,
    input: ",a",
    output: ["1"],
    context: {},
  });

  assertEquals(parser("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: {},
  });
});

Deno.test("sepEndBy", () => {
  assertEquals(sepEndBy(char(","), digit())("a"), {
    ok: true,
    input: "a",
    output: [],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit())(",a"), {
    ok: true,
    input: ",a",
    output: [],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit())("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit())("1,a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit())("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1,2a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1,2,a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1,2,3,a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepEndBy,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 2)("1,a"), {
    ok: false,
    input: "a",
    error: {
      kind: ErrorKind.SepEndBy,
      output: ["1"],
    },
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 1, 2)("1,2,a"), {
    ok: true,
    input: "a",
    output: ["1", "2"],
    context: {},
  });

  assertEquals(sepEndBy(char(","), digit(), 1, 2)("1,2,3a"), {
    ok: true,
    input: "3a",
    output: ["1", "2"],
    context: {},
  });

  assertThrows(
    () => sepEndBy(char(","), digit(), 3, 2),
    RangeError,
    "Maximum value must be greater than minimum value.",
  );
});

Deno.test("sepEndBy1", () => {
  const parser = sepEndBy1(char(","), digit());

  assertEquals(parser("1a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(parser("1,a"), {
    ok: true,
    input: "a",
    output: ["1"],
    context: {},
  });

  assertEquals(parser("1,2,3a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("1,2,3,a"), {
    ok: true,
    input: "a",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: {},
  });

  assertEquals(parser(",a"), {
    ok: false,
    input: ",a",
    error: ErrorKind.Digit,
    context: {},
  });
});
