import type { IParser, Result } from "./core.ts";
import { ErrorKind } from "./error.ts";

// TODO: enhance the type by using template literal type.
function ensureSingleCharacter(str: string): asserts str is string {
  if (str.length !== 1) {
    throw new TypeError(
      "Argument of character parser must be a single character.",
    );
  }
}

/**
 * Parse a specified character.
 *
 * When constructing the parser,
 * if a non-single-character string passed,
 * an error will be thrown.
 *
 *     char("a")("a").output === "a";
 *     char("a")("b").ok === false;
 *
 * @param char character to be parsed
 */
export function char<Char extends string>(
  char: Char,
): IParser<Char, ErrorKind.Char, string> {
  ensureSingleCharacter(char);

  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, Char, ErrorKind.Char, C> {
    const { char, charCode } = parse;
    if (input.charCodeAt(0) === charCode) {
      return {
        ok: true,
        input: input.slice(1),
        output: char,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Char,
        context,
      };
    }
  }
  parse.char = char;
  parse.charCode = char.charCodeAt(0);

  return parse;
}

/**
 * Parse any single character.
 *
 *     anyChar()("a").output === "a";
 */
export function anyChar(): IParser<string, ErrorKind.AnyChar, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, string, ErrorKind.AnyChar, C> => {
    if (input === "") {
      return {
        ok: false,
        input,
        error: ErrorKind.AnyChar,
        context,
      };
    } else {
      return {
        ok: true,
        input: input.slice(1),
        output: input.charAt(0),
        context,
      };
    }
  };
}

/**
 * Parse one of provided characters.
 *
 *     const parser = oneOfChars("a", "b");
 *     parser("a").output === "a";
 *     parser("c").ok === false;
 *
 * @param chars acceptable characters
 */
export function oneOfChars<S extends readonly string[]>(
  ...chars: S
): IParser<S[number], ErrorKind.OneOfChars, string> {
  chars.forEach(ensureSingleCharacter);

  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, S[number], ErrorKind.OneOfChars, C> {
    const firstCharCode = input.charCodeAt(0);

    if (parse.charCodes.includes(firstCharCode)) {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0],
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.OneOfChars,
        context,
      };
    }
  }
  parse.charCodes = chars.map((char) => char.charCodeAt(0));

  return parse;
}

/**
 * Parse any character but not in provided characters.
 *
 *
 *     const parser = noneOfChars("a", "b");
 *     parser("a").ok === false;
 *     parser("c").output === "c";
 *
 * @param chars characters to be excluded
 */
export function noneOfChars<S extends readonly string[]>(
  ...chars: S
): IParser<string, ErrorKind.NoneOfChars, string> {
  chars.forEach(ensureSingleCharacter);

  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, string, ErrorKind.NoneOfChars, C> {
    const firstCharCode = input.charCodeAt(0);
    if (parse.charCodes.includes(firstCharCode)) {
      return {
        ok: false,
        input,
        error: ErrorKind.NoneOfChars,
        context,
      };
    } else {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0],
        context,
      };
    }
  }
  parse.charCodes = chars.map((char) => char.charCodeAt(0));

  return parse;
}

/**
 * Parse escaped characters and
 * convert values according to provided "entries".
 *
 *     const parser = escapedWith("\\", [["n", "\n"], ["r", "\r"]]);
 *     parser("\\n").output === "\n";
 *     parser("\\b").ok === false;
 *
 * @param controlChar Control char, like "\\" in most programming languages.
 * @param entries Entries map to look up escaping.
 */
export function escapedWith<V>(
  controlChar: string,
  entries: readonly (readonly [string, V])[],
): IParser<V, ErrorKind.EscapedWith, string> {
  ensureSingleCharacter(controlChar);
  entries.forEach(([key]) => ensureSingleCharacter(key));

  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, V, ErrorKind.EscapedWith, C> {
    const firstCharCode = input.charCodeAt(0);

    if (firstCharCode === parse.controlCharCode) {
      const value = parse.map.get(input.charCodeAt(1));
      if (value !== undefined) {
        return {
          ok: true,
          input: input.slice(2),
          output: value,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedWith,
          context,
        };
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.EscapedWith,
        context,
      };
    }
  }
  parse.controlCharCode = controlChar.charCodeAt(0);
  parse.map = new Map(
    entries.map(([key, value]) => [key.charCodeAt(0), value]),
  );

  return parse;
}

/**
 * Parse escaped characters by calling a provided transformer function
 * to allow to customize escaping logic.
 *
 *     const parser = escapedBy("\\", (char) => {
 *       if (char === "n") {
 *         return "\n";
 *       }
 *     });
 *     parser("\\n").output === "\n";
 *     parser("\\t").ok === false;
 *
 * @param controlChar Control char, like "\\" in most programming languages.
 * @param transformer Transformer function, with a single character as argument.
 */
export function escapedBy<V>(
  controlChar: string,
  transformer: (char: string) => V,
): IParser<V, ErrorKind.EscapedBy, string> {
  ensureSingleCharacter(controlChar);

  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, V, ErrorKind.EscapedBy, C> {
    if (input.length < 2) {
      return {
        ok: false,
        input,
        error: ErrorKind.EscapedBy,
        context,
      };
    }

    const { controlCharCode, transformer } = parse;
    const firstCharCode = input.charCodeAt(0);

    if (firstCharCode === controlCharCode) {
      const output = transformer(input[1]);
      if (output !== null && output !== undefined) {
        return {
          ok: true,
          input: input.slice(2),
          output: output as NonNullable<V>,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedBy,
          context,
        };
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.EscapedBy,
        context,
      };
    }
  }
  parse.controlCharCode = controlChar.charCodeAt(0);
  parse.transformer = transformer;

  return parse;
}

type OctalDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

/**
 * Parse an octal digit.
 *
 *     octal()("7").output === "7";
 *     octal()("8").ok === false;
 */
export function octal(): IParser<OctalDigit, ErrorKind.Octal, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, OctalDigit, ErrorKind.Octal, C> => {
    const charCode = input.charCodeAt(0);
    if (charCode >= 48 && charCode <= 55) {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0] as OctalDigit,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Octal,
        context,
      };
    }
  };
}

type Digit = OctalDigit | "8" | "9";

/**
 * Parse a digit.
 *
 *     digit()("9").output === "9";
 *     digit()("a").ok === false;
 */
export function digit(): IParser<Digit, ErrorKind.Digit, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, Digit, ErrorKind.Digit, C> => {
    const charCode = input.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0] as Digit,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Digit,
        context,
      };
    }
  };
}

type Hexadecimal =
  | Digit
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F";
type HexCase = "both" | "upper" | "lower";

/**
 * Parse a hexadecimal character.
 *
 *     hex()("5").output === "5";
 *     hex()("a").output === "a";
 *     hex()("A").output === "A";
 *     hex("upper")("a").ok === false;
 *     hex("lower")("A").ok === false;
 *
 * @param hexCase Hexadecimal case. Default is "both".
 */
export function hex(
  hexCase: HexCase = "both",
): IParser<
  Hexadecimal,
  ErrorKind.Hex | ErrorKind.UpperHex | ErrorKind.LowerHex,
  string
> {
  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<
    string,
    Hexadecimal,
    ErrorKind.Hex | ErrorKind.UpperHex | ErrorKind.LowerHex,
    C
  > {
    const charCode = input.charCodeAt(0);

    if (charCode >= 48 && charCode <= 57) {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0] as Digit,
        context,
      };
    }

    const { hexCase } = parse;
    if (hexCase === "both") {
      if (charCode >= 65 && charCode <= 70) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Hexadecimal,
          context,
        };
      } else if (charCode >= 97 && charCode <= 102) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Hexadecimal,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Hex,
          context,
        };
      }
    } else if (hexCase === "upper") {
      if (charCode >= 65 && charCode <= 70) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Hexadecimal,
          context,
        };
      } else if (charCode >= 97 && charCode <= 102) {
        return {
          ok: false,
          input,
          error: ErrorKind.UpperHex,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Hex,
          context,
        };
      }
    } else {
      if (charCode >= 97 && charCode <= 102) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Hexadecimal,
          context,
        };
      } else if (charCode >= 65 && charCode <= 70) {
        return {
          ok: false,
          input,
          error: ErrorKind.LowerHex,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Hex,
          context,
        };
      }
    }
  }
  parse.hexCase = hexCase;

  return parse;
}

type LowerAlpha =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
type UpperAlpha =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

/**
 * Parse an alphabet character.
 *
 *     alpha()("m").output === "m";
 *     alpha()("M").output === "M";
 */
export function alpha(): IParser<
  LowerAlpha | UpperAlpha,
  ErrorKind.Alphabet,
  string
> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, LowerAlpha | UpperAlpha, ErrorKind.Alphabet, C> => {
    const charCode = input.charCodeAt(0);
    if (
      charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122
    ) {
      return {
        ok: true,
        input: input.slice(1),
        output: input.charAt(0) as LowerAlpha | UpperAlpha,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Alphabet,
        context,
      };
    }
  };
}

/**
 * Parse a lowercase alphabet character.
 *
 *     lower()("m").output === "m";
 *     lower()("M").ok === false;
 */
export function lower(): IParser<LowerAlpha, ErrorKind.LowerAlphabet, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, LowerAlpha, ErrorKind.LowerAlphabet, C> => {
    const charCode = input.charCodeAt(0);
    if (
      charCode >= 97 && charCode <= 122
    ) {
      return {
        ok: true,
        input: input.slice(1),
        output: input.charAt(0) as LowerAlpha,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.LowerAlphabet,
        context,
      };
    }
  };
}

/**
 * Parse an uppercase alphabet character.
 *
 *     upper()("m").ok === false;
 *     upper()("M").output === "M";
 */
export function upper(): IParser<UpperAlpha, ErrorKind.UpperAlphabet, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, UpperAlpha, ErrorKind.UpperAlphabet, C> => {
    const charCode = input.charCodeAt(0);
    if (
      charCode >= 65 && charCode <= 90
    ) {
      return {
        ok: true,
        input: input.slice(1),
        output: input.charAt(0) as UpperAlpha,
        context,
      };
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.UpperAlphabet,
        context,
      };
    }
  };
}
