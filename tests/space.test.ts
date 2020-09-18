import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import {
  space,
  cr,
  lf,
  crlf,
  linebreak,
  tab,
  trim,
  eof,
  alpha,
  ErrorKind,
} from "../mod.ts";

Deno.test("space", () => {
  assertEquals(space().parse("  "), {
    ok: true,
    input: " ",
    output: " ",
  });

  assertEquals(space().parse("\n"), {
    ok: false,
    input: "\n",
    error: ErrorKind.Space,
  });
});

Deno.test("cr", () => {
  assertEquals(cr().parse("\rabc"), {
    ok: true,
    input: "abc",
    output: "\r",
  });

  assertEquals(cr().parse("\nabc"), {
    ok: false,
    input: "\nabc",
    error: ErrorKind.CarriageReturn,
  });
});

Deno.test("lf", () => {
  assertEquals(lf().parse("\nabc"), {
    ok: true,
    input: "abc",
    output: "\n",
  });

  assertEquals(lf().parse("\rabc"), {
    ok: false,
    input: "\rabc",
    error: ErrorKind.LineFeed,
  });
});

Deno.test("crlf", () => {
  assertEquals(crlf().parse("\r\nabc"), {
    ok: true,
    input: "abc",
    output: "\r\n",
  });

  assertEquals(crlf().parse("\nabc"), {
    ok: false,
    input: "\nabc",
    error: ErrorKind.CarriageReturnLineFeed,
  });
});

Deno.test("linebreak", () => {
  assertEquals(linebreak().parse("\r\nabc"), {
    ok: true,
    input: "abc",
    output: "\r\n",
  });

  assertEquals(linebreak().parse("\nabc"), {
    ok: true,
    input: "abc",
    output: "\n",
  });

  assertEquals(linebreak().parse("\rabc"), {
    ok: false,
    input: "\rabc",
    error: ErrorKind.Linebreak,
  });
});

Deno.test("tab", () => {
  assertEquals(tab().parse("\tabc"), {
    ok: true,
    input: "abc",
    output: "\t",
  });

  assertEquals(tab().parse(" abc"), {
    ok: false,
    input: " abc",
    error: ErrorKind.Tab,
  });
});

Deno.test("trim", () => {
  const result = trim(alpha()).parse("  \n  \t  \r  \f  abc");
  assertEquals(result, {
    ok: true,
    input: "bc",
    output: "a",
  });
});

Deno.test("eof", () => {
  assertEquals(eof().parse(""), {
    ok: true,
    input: "",
    output: undefined,
  });

  assertEquals(eof().parse("t"), {
    ok: false,
    input: "t",
    error: ErrorKind.EndOfFile,
  });

  assertEquals(eof().parse(Uint8Array.of()), {
    ok: true,
    input: Uint8Array.of(),
    output: undefined,
  });

  assertEquals(eof().parse(Uint8Array.of(65)), {
    ok: false,
    input: Uint8Array.of(65),
    error: ErrorKind.EndOfFile,
  });
});
