// deno-lint-ignore-file ban-ts-comment
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  between,
  serial,
  prefix,
  suffix,
  char,
  digit,
  ErrorKind,
  IParser,
} from "../mod.ts";

Deno.test("between", () => {
  assertEquals(
    between(char("["), char("]"), digit())("[5]"),
    digit()("5"),
  );

  assertEquals(
    between(char("["), char("]"), digit())("5]"),
    char("[")("5]"),
  );

  assertEquals(
    between(char("["), char("]"), digit())("[]"),
    digit()("]"),
  );

  assertEquals(
    between(char("["), char("]"), digit())("[5"),
    char("]")(""),
  );
});

Deno.test("serial", () => {
  const parser = serial(char("1"), char("2"), char("3"));

  assertEquals(parser("1234"), {
    ok: true,
    input: "4",
    output: ["1", "2", "3"],
    context: {},
  });

  assertEquals(parser("124"), {
    ok: false,
    input: "4",
    error: ErrorKind.Char,
    context: {},
  });

  // context typing tests
  const parser1 = digit() as IParser<string, ErrorKind, string, { t1: string }>;
  const parser2 = digit() as IParser<string, ErrorKind, string, { t2: number }>;
  const parser3 = serial(parser1, parser2);
  // @ts-expect-error
  parser3("", { t1: "" });
  // @ts-expect-error
  parser3("", { t2: 0 });
  // @ts-expect-error
  parser3("", { t1: 0, t2: "" });
  const _: { t1: string; t2: number; t3: boolean } =
    parser3("", { t1: "", t2: 0, t3: true }).context;
});

Deno.test("prefix", () => {
  const parser = prefix(char("<"), digit());

  assertEquals(parser("<5"), {
    ok: true,
    input: "",
    output: "5",
    context: {},
  });

  assertEquals(parser("[5"), {
    ok: false,
    input: "[5",
    error: ErrorKind.Char,
    context: {},
  });

  assertEquals(parser("<a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: {},
  });
});

Deno.test("suffix", () => {
  const parser = suffix(digit(), char(">"));

  assertEquals(parser("5>"), {
    ok: true,
    input: "",
    output: "5",
    context: {},
  });

  assertEquals(parser("5]"), {
    ok: false,
    input: "]",
    error: ErrorKind.Char,
    context: {},
  });

  assertEquals(parser("a>"), {
    ok: false,
    input: "a>",
    error: ErrorKind.Digit,
    context: {},
  });
});
