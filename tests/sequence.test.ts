import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import { between, serial, char, digit, ErrorKind } from "../mod.ts";

Deno.test("between", () => {
  assertEquals(
    between(char("["), char("]"), digit()).parse("[5]"),
    digit().parse("5"),
  );

  assertEquals(
    between(char("["), char("]"), digit()).parse("5]"),
    char("[").parse("5]"),
  );

  assertEquals(
    between(char("["), char("]"), digit()).parse("[]"),
    digit().parse("]"),
  );

  assertEquals(
    between(char("["), char("]"), digit()).parse("[5"),
    char("]").parse(""),
  );
});

Deno.test("serial", () => {
  const parser = serial(char("1"), char("2"), char("3"));

  assertEquals(parser.parse("1234"), {
    ok: true,
    input: "4",
    output: ["1", "2", "3"],
  });

  assertEquals(parser.parse("124"), {
    ok: false,
    input: "4",
    error: ErrorKind.Char,
  });
});
