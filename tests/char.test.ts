import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.69.0/testing/asserts.ts";
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

  assertEquals(char("a").parse("ab"), {
    ok: true,
    input: "b",
    output: "a",
  });

  assertEquals(char("a").parse("b"), {
    ok: false,
    input: "b",
    error: ErrorKind.Char,
  });
});

Deno.test("anyChar", () => {
  assertEquals(anyChar().parse("test"), {
    ok: true,
    input: "est",
    output: "t",
  });

  assertEquals(anyChar().parse(""), {
    ok: false,
    input: "",
    error: ErrorKind.AnyChar,
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
    assertEquals(parser.parse(`${char}-`), {
      ok: true,
      input: "-",
      output: char,
    });
  });

  assertEquals(parser.parse("d"), {
    ok: false,
    input: "d",
    error: ErrorKind.OneOfChars,
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
    assertEquals(parser.parse(char), {
      ok: false,
      input: char,
      error: ErrorKind.NoneOfChars,
    });
  });

  assertEquals(parser.parse("d"), {
    ok: true,
    input: "",
    output: "d",
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
    assertEquals(parser.parse(`\\${char}`), {
      ok: true,
      input: "",
      output: raw,
    });
  });

  assertEquals(parser.parse("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedWith,
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
  assertEquals(parser1.parse("\\n"), {
    ok: true,
    input: "",
    output: 10,
  });
  assertEquals(parser1.parse("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedBy,
  });
  assertEquals(parser1.parse("\\"), {
    ok: false,
    input: "\\",
    error: ErrorKind.EscapedBy,
  });

  const parser2 = escapedBy("\\", (char) => {
    if (char === "n") {
      return 10;
    }
  });
  assertEquals(parser2.parse("\\n"), {
    ok: true,
    input: "",
    output: 10,
  });
  assertEquals(parser2.parse("\\t"), {
    ok: false,
    input: "\\t",
    error: ErrorKind.EscapedBy,
  });
  assertEquals(parser2.parse("\\"), {
    ok: false,
    input: "\\",
    error: ErrorKind.EscapedBy,
  });
});

Deno.test("string", () => {
  assertEquals(string("str").parse("string"), {
    ok: true,
    input: "ing",
    output: "str",
  });

  assertEquals(string("str").parse(""), {
    ok: false,
    input: "",
    error: ErrorKind.String,
  });
});

Deno.test("octal", () => {
  for (let i = 0; i <= 7; i += 1) {
    const num = i.toString();
    assertEquals(octal().parse(num), {
      ok: true,
      input: "",
      output: num,
    });
  }

  assertEquals(octal().parse("8"), {
    ok: false,
    input: "8",
    error: ErrorKind.Octal,
  });
});

Deno.test("digit", () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString();
    assertEquals(digit().parse(num), {
      ok: true,
      input: "",
      output: num,
    });
  }

  assertEquals(digit().parse("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.Digit,
  });
});

Deno.test("hex", () => {
  for (let i = 0; i <= 9; i += 1) {
    const num = i.toString();
    assertEquals(hex().parse(num), {
      ok: true,
      input: "",
      output: num,
    });
  }

  const lower = ["a", "b", "c", "d", "e", "f"];
  const upper = lower.map((c) => c.toUpperCase());

  lower.forEach((c) => {
    assertEquals(hex().parse(c), {
      ok: true,
      input: "",
      output: c,
    });
  });

  upper.forEach((c) => {
    assertEquals(hex().parse(c), {
      ok: true,
      input: "",
      output: c,
    });
  });

  lower.forEach((c) => {
    assertEquals(hex("lower").parse(c), {
      ok: true,
      input: "",
      output: c,
    });
  });

  upper.forEach((c) => {
    assertEquals(hex("lower").parse(c), {
      ok: false,
      input: c,
      error: ErrorKind.LowerHex,
    });
  });

  lower.forEach((c) => {
    assertEquals(hex("upper").parse(c), {
      ok: false,
      input: c,
      error: ErrorKind.UpperHex,
    });
  });

  upper.forEach((c) => {
    assertEquals(hex("upper").parse(c), {
      ok: true,
      input: "",
      output: c,
    });
  });

  assertEquals(hex().parse("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
  });

  assertEquals(hex("upper").parse("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
  });

  assertEquals(hex("lower").parse("h"), {
    ok: false,
    input: "h",
    error: ErrorKind.Hex,
  });
});

Deno.test("alpha", () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(alpha().parse(char), {
      ok: true,
      input: "",
      output: char,
    });
  }

  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(alpha().parse(char), {
      ok: true,
      input: "",
      output: char,
    });
  }

  assertEquals(alpha().parse("5"), {
    ok: false,
    input: "5",
    error: ErrorKind.Alphabet,
  });
});

Deno.test("lower", () => {
  for (let i = 97; i <= 122; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(lower().parse(char), {
      ok: true,
      input: "",
      output: char,
    });
  }

  assertEquals(lower().parse("A"), {
    ok: false,
    input: "A",
    error: ErrorKind.LowerAlphabet,
  });
});

Deno.test("upper", () => {
  for (let i = 65; i <= 90; i += 1) {
    const char = String.fromCharCode(i);
    assertEquals(upper().parse(char), {
      ok: true,
      input: "",
      output: char,
    });
  }

  assertEquals(upper().parse("a"), {
    ok: false,
    input: "a",
    error: ErrorKind.UpperAlphabet,
  });
});
