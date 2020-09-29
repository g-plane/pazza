import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  space,
  cr,
  lf,
  crlf,
  linebreak,
  tab,
  whitespace,
  trim,
  eof,
  alpha,
  ErrorKind,
} from "../mod.ts";

Deno.test("space", () => {
  assertEquals(space()("  "), {
    ok: true,
    input: " ",
    output: " ",
    context: {},
  });

  assertEquals(space()("\n"), {
    ok: false,
    input: "\n",
    error: ErrorKind.Space,
    context: {},
  });
});

Deno.test("cr", () => {
  assertEquals(cr()("\rabc"), {
    ok: true,
    input: "abc",
    output: "\r",
    context: {},
  });

  assertEquals(cr()("\nabc"), {
    ok: false,
    input: "\nabc",
    error: ErrorKind.CarriageReturn,
    context: {},
  });
});

Deno.test("lf", () => {
  assertEquals(lf()("\nabc"), {
    ok: true,
    input: "abc",
    output: "\n",
    context: {},
  });

  assertEquals(lf()("\rabc"), {
    ok: false,
    input: "\rabc",
    error: ErrorKind.LineFeed,
    context: {},
  });
});

Deno.test("crlf", () => {
  assertEquals(crlf()("\r\nabc"), {
    ok: true,
    input: "abc",
    output: "\r\n",
    context: {},
  });

  assertEquals(crlf()("\nabc"), {
    ok: false,
    input: "\nabc",
    error: ErrorKind.CarriageReturnLineFeed,
    context: {},
  });
});

Deno.test("linebreak", () => {
  assertEquals(linebreak()("\r\nabc"), {
    ok: true,
    input: "abc",
    output: "\r\n",
    context: {},
  });

  assertEquals(linebreak()("\nabc"), {
    ok: true,
    input: "abc",
    output: "\n",
    context: {},
  });

  assertEquals(linebreak()("\rabc"), {
    ok: false,
    input: "\rabc",
    error: ErrorKind.Linebreak,
    context: {},
  });
});

Deno.test("tab", () => {
  assertEquals(tab()("\tabc"), {
    ok: true,
    input: "abc",
    output: "\t",
    context: {},
  });

  assertEquals(tab()(" abc"), {
    ok: false,
    input: " abc",
    error: ErrorKind.Tab,
    context: {},
  });
});

Deno.test("whitespace", () => {
  const unicodeWhitespace = [
    "\u0009",
    "\u000A",
    "\u000B",
    "\u000C",
    "\u000D",
    "\u0020",
    "\u0085",
    "\u00A0",
    "\u1680",
    "\u2000",
    "\u2001",
    "\u2002",
    "\u2003",
    "\u2004",
    "\u2005",
    "\u2006",
    "\u2007",
    "\u2008",
    "\u2009",
    "\u200A",
    "\u2028",
    "\u2029",
    "\u202F",
    "\u205F",
    "\u3000",
  ];

  unicodeWhitespace.forEach((char) => {
    assertEquals(whitespace()(char), {
      ok: true,
      input: "",
      output: char,
      context: {},
    });
  });

  assertEquals(whitespace()("\uFEFF"), {
    ok: false,
    input: "\uFEFF",
    error: ErrorKind.Whitespace,
    context: {},
  });
});

Deno.test("trim", () => {
  const result = trim(alpha())("  \n  \t  \r  \f  abc");
  assertEquals(result, {
    ok: true,
    input: "bc",
    output: "a",
    context: {},
  });
});

Deno.test("eof", () => {
  assertEquals(eof()(""), {
    ok: true,
    input: "",
    output: undefined,
    context: {},
  });

  assertEquals(eof()("t"), {
    ok: false,
    input: "t",
    error: ErrorKind.EndOfFile,
    context: {},
  });

  assertEquals(eof()(Uint8Array.of()), {
    ok: true,
    input: Uint8Array.of(),
    output: undefined,
    context: {},
  });

  assertEquals(eof()(Uint8Array.of(65)), {
    ok: false,
    input: Uint8Array.of(65),
    error: ErrorKind.EndOfFile,
    context: {},
  });
});
