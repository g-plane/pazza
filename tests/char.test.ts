import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  char,
  anyChar,
  oneOfChars,
  noneOfChars,
  escapedWith,
  escapedBy,
  string,
  octal,
  digit,
  hex,
  alpha,
  lower,
  upper,
  ErrorKind,
} from "../mod.ts";

Deno.test("char", () => {
  assertThrows(
    () => char(""),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => char("ab"),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertEquals(char("a")("ab"), {
    ok: true,
    input: "b",
    output: "a",
    context: {},
  });

  assertEquals(char("a")("b"), {
    ok: false,
    input: "b",
    error: ErrorKind.Char,
    context: {},
  });
});

Deno.test("anyChar", () => {
  assertEquals(anyChar()("test"), {
    ok: true,
    input: "est",
    output: "t",
    context: {},
  });

  assertEquals(anyChar()(""), {
    ok: false,
    input: "",
    error: ErrorKind.AnyChar,
    context: {},
  });
});

Deno.test("oneOfChars", () => {
  assertThrows(
    () => oneOfChars("", "a"),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => oneOfChars("a", "bc"),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  const chars = ["a", "b", "c"];
  const parser = oneOfChars(...chars);

  chars.forEach((char) => {
    assertEquals(parser(`${char}-`), {
      ok: true,
      input: "-",
      output: char,
      context: {},
    });
  });

  assertEquals(parser("d"), {
    ok: false,
    input: "d",
    error: ErrorKind.OneOfChars,
    context: {},
  });
});

Deno.test("noneOfChars", () => {
  assertThrows(
    () => noneOfChars("", "a"),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => noneOfChars("a", "bc"),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  const chars = ["a", "b", "c"];
  const parser = noneOfChars(...chars);

  chars.forEach((char) => {
    assertEquals(parser(char), {
      ok: false,
      input: char,
      error: ErrorKind.NoneOfChars,
      context: {},
    });
  });

  assertEquals(parser("d"), {
    ok: true,
    input: "",
    output: "d",
    context: {},
  });
});

Deno.test("escapedWith", () => {
  assertThrows(
    () => escapedWith("", [["a", ""], ["b", ""]]),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => escapedWith("ab", [["a", ""], ["b", ""]]),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => escapedWith("a", [["ab", ""], ["c", ""]]),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => escapedWith("a", [["", ""], ["ab", ""]]),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  const chars = [["n", "\n"], ["\\", "\\"]] as const;
  const parser = escapedWith("\\", chars);

  chars.forEach(([char, raw]) => {
    assertEquals(parser(`\\${char}`), {
      ok: true,
      input: "",
      output: raw,
      context: {},
    });
  });

  assertEquals(parser("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedWith,
    context: {},
  });
});

Deno.test("escapedBy", () => {
  assertThrows(
    () => escapedBy("", (_) => true),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  assertThrows(
    () => escapedBy("ab", (_) => true),
    TypeError,
    "Argument of character parser must be a single character.",
  );

  const parser1 = escapedBy("\\", (char) => {
    if (char === "n") {
      return 10;
    } else {
      return null;
    }
  });
  assertEquals(parser1("\\n"), {
    ok: true,
    input: "",
    output: 10,
    context: {},
  });
  assertEquals(parser1("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedBy,
    context: {},
  });
  assertEquals(parser1("\\"), {
    ok: false,
    input: "\\",
    error: ErrorKind.EscapedBy,
    context: {},
  });

  const parser2 = escapedBy("\\", (char) => {
    if (char === "n") {
      return 10;
    }
  });
  assertEquals(parser2("\\n"), {
    ok: true,
    input: "",
    output: 10,
    context: {},
  });
  assertEquals(parser2("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedBy,
    context: {},
  });
  assertEquals(parser2("\\"), {
    ok: false,
    input: "\\",
    error: ErrorKind.EscapedBy,
    context: {},
  });
});

Deno.test("string", () => {
  assertEquals(string("str")("string"), {
    ok: true,
    input: "ing",
    output: "str",
    context: {},
  });

  assertEquals(string("str")(""), {
    ok: false,
    input: "",
    error: ErrorKind.String,
    context: {},
  });
});

Deno.test("octal", () => {
  for (let i = 0; i <= 7; i += 1) {
    const num = i.toString();
    assertEquals(octal()(num), {
      ok: true,
      input: "",
      output: num,
      context: {},
    });
  }

  assertEquals(octal()("8"), {
    ok: false,
    input: "8",
    error: ErrorKind.Octal,
    context: {},
  });
});

Deno.test("digit", () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString();
    assertEquals(digit()(num), {
      ok: true,
      input: "",
      output: num,
      context: {},
    });
  }

  assertEquals(digit()("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
    context: {},
  });
});

Deno.test("hex", () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString();
    assertEquals(hex()(num), {
      ok: true,
      input: "",
      output: num,
      context: {},
    });
  }

  const lower = ["a", "b", "c", "d", "e", "f"];
  const upper = lower.map((c) => c.toUpperCase());

  lower.forEach((c) => {
    assertEquals(hex()(c), {
      ok: true,
      input: "",
      output: c,
      context: {},
    });
  });

  upper.forEach((c) => {
    assertEquals(hex()(c), {
      ok: true,
      input: "",
      output: c,
      context: {},
    });
  });

  lower.forEach((c) => {
    assertEquals(hex("lower")(c), {
      ok: true,
      input: "",
      output: c,
      context: {},
    });
  });

  upper.forEach((c) => {
    assertEquals(hex("lower")(c), {
      ok: false,
      input: c,
      error: ErrorKind.LowerHex,
      context: {},
    });
  });

  lower.forEach((c) => {
    assertEquals(hex("upper")(c), {
      ok: false,
      input: c,
      error: ErrorKind.UpperHex,
      context: {},
    });
  });

  upper.forEach((c) => {
    assertEquals(hex("upper")(c), {
      ok: true,
      input: "",
      output: c,
      context: {},
    });
  });

  assertEquals(hex()("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
    context: {},
  });

  assertEquals(hex("upper")("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
    context: {},
  });

  assertEquals(hex("lower")("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
    context: {},
  });
});

Deno.test("alpha", () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(alpha()(char), {
      ok: true,
      input: "",
      output: char,
      context: {},
    });
  }

  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(alpha()(char), {
      ok: true,
      input: "",
      output: char,
      context: {},
    });
  }

  assertEquals(alpha()("5"), {
    ok: false,
    input: "5",
    error: ErrorKind.Alphabet,
    context: {},
  });
});

Deno.test("lower", () => {
  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(lower()(char), {
      ok: true,
      input: "",
      output: char,
      context: {},
    });
  }

  assertEquals(lower()("A"), {
    ok: false,
    input: "A",
    error: ErrorKind.LowerAlphabet,
    context: {},
  });
});

Deno.test("upper", () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(upper()(char), {
      ok: true,
      input: "",
      output: char,
      context: {},
    });
  }

  assertEquals(upper()("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.UpperAlphabet,
    context: {},
  });
});
