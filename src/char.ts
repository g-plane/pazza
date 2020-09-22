import type { IParser } from "./core.ts";
import { ErrorKind } from "./error.ts";

function ensureSingleCharacter(str: string) {
  if (str.length !== 1) {
    throw new TypeError(
      "Argument of character parser must be a single character.",
    );
  }
}

interface CharParser<C> extends IParser<C, ErrorKind.Char, string> {
  char: C;
  charCode: number;
}
/**
 * Parse a specified character.
 *
 * When constructing the parser,
 * if a non-single-character string passed,
 * an error will be thrown.
 *
 *     char("a").parse("a").output === "a";
 *     char("a").parse("b").ok === false;
 *
 * @param char character to be parsed
 */
export function char<C extends string>(char: C): CharParser<C> {
  ensureSingleCharacter(char);

  return {
    char,
    charCode: char.charCodeAt(0),
    parse(input, context) {
      const { char, charCode } = this;
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
    },
  };
}

/**
 * Parse any single character.
 *
 *     anyChar().parse("a").output === "a";
 */
export function anyChar(): IParser<string, ErrorKind.AnyChar, string> {
  return {
    parse(input, context) {
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
    },
  };
}

interface OneOfCharsParser<S extends readonly string[]>
  extends IParser<S[number], ErrorKind.OneOfChars, string> {
  charCodes: number[];
}
/**
 * Parse one of provided characters.
 *
 *     const parser = oneOfChars("a", "b");
 *     parser.parse("a").output === "a";
 *     parser.parse("c").ok === false;
 *
 * @param chars acceptable characters
 */
export function oneOfChars<S extends readonly string[]>(
  ...chars: S
): OneOfCharsParser<S> {
  chars.forEach(ensureSingleCharacter);

  return {
    charCodes: chars.map((char) => char.charCodeAt(0)),
    parse(input, context) {
      const { charCodes } = this;
      const firstCharCode = input.charCodeAt(0);

      if (charCodes.includes(firstCharCode)) {
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
    },
  };
}

interface NoneOfCharsParser
  extends IParser<string, ErrorKind.NoneOfChars, string> {
  charCodes: number[];
}
/**
 * Parse any character but not in provided characters.
 *
 *
 *     const parser = noneOfChars("a", "b");
 *     parser.parse("a").ok === false;
 *     parser.parse("c").output === "c";
 *
 * @param chars characters to be excluded
 */
export function noneOfChars<S extends readonly string[]>(
  ...chars: S
): NoneOfCharsParser {
  chars.forEach(ensureSingleCharacter);

  return {
    charCodes: chars.map((char) => char.charCodeAt(0)),
    parse(input, context) {
      const { charCodes } = this;
      const firstCharCode = input.charCodeAt(0);
      if (charCodes.includes(firstCharCode)) {
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
    },
  };
}

interface EscapedWithParser<V>
  extends IParser<V, ErrorKind.EscapedWith, string> {
  controlCharCode: number;
  map: Map<number, V>;
}
/**
 * Parse escaped characters and
 * convert values according to provided "entries".
 *
 *     const parser = escapedWith("\\", [["n", "\n"], ["r", "\r"]]);
 *     parser.parse("\\n").output === "\n";
 *     parser.parse("\\b").ok === false;
 *
 * @param controlChar Control char, like "\\" in most programming languages.
 * @param entries Entries map to look up escaping.
 */
export function escapedWith<V>(
  controlChar: string,
  entries: readonly (readonly [string, V])[],
): EscapedWithParser<V> {
  ensureSingleCharacter(controlChar);
  entries.forEach(([key]) => ensureSingleCharacter(key));

  return {
    controlCharCode: controlChar.charCodeAt(0),
    map: new Map(entries.map(([key, value]) => [key.charCodeAt(0), value])),
    parse(input, context) {
      const { controlCharCode, map } = this;
      const firstCharCode = input.charCodeAt(0);

      if (firstCharCode === controlCharCode) {
        const value = map.get(input.charCodeAt(1));
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
    },
  };
}

interface EscapedByParser<V>
  extends IParser<NonNullable<V>, ErrorKind.EscapedBy, string> {
  controlCharCode: number;
  transformer: (char: string) => V;
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
 *     parser.parse("\\n").output === "\n";
 *     parser.parse("\\t").ok === false;
 *
 * @param controlChar Control char, like "\\" in most programming languages.
 * @param transformer Transformer function, with a single character as argument.
 */
export function escapedBy<V>(
  controlChar: string,
  transformer: (char: string) => V,
): EscapedByParser<V> {
  ensureSingleCharacter(controlChar);

  return {
    controlCharCode: controlChar.charCodeAt(0),
    transformer,
    parse(input, context) {
      if (input.length < 2) {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedBy,
          context,
        };
      }

      const { controlCharCode, transformer } = this;
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
    },
  };
}

interface StringParser<S> extends IParser<S, ErrorKind.String, string> {
  literal: S;
}
/**
 * Parse a specified string.
 *
 *     const parser = string("ab");
 *     parser.parse("ab").output === "ab";
 *     parser.parse("ac").ok === false;
 *
 * @param literal string literal
 */
export function string<S extends string>(literal: S): StringParser<S> {
  return {
    literal,
    parse(input, context) {
      const { literal } = this;
      if (input.slice(0, literal.length) === literal) {
        return {
          ok: true,
          input: input.slice(literal.length),
          output: literal,
          context,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.String,
          context,
        };
      }
    },
  };
}

type OctalDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

/**
 * Parse an octal digit.
 *
 *     octal().parse("7").output === "7";
 *     octal().parse("8").ok === false;
 */
export function octal(): IParser<OctalDigit, ErrorKind.Octal, string> {
  return {
    parse(input, context) {
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
    },
  };
}

type Digit = OctalDigit | "8" | "9";

/**
 * Parse a digit.
 *
 *     digit().parse("9").output === "9";
 *     digit().parse("a").ok === false;
 */
export function digit(): IParser<Digit, ErrorKind.Digit, string> {
  return {
    parse(input, context) {
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
    },
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

interface HexParser extends
  IParser<
    Hexadecimal,
    ErrorKind.Hex | ErrorKind.UpperHex | ErrorKind.LowerHex,
    string
  > {
  hexCase: HexCase;
}
/**
 * Parse a hexadecimal character.
 *
 *     hex().parse("5").output === "5";
 *     hex().parse("a").output === "a";
 *     hex().parse("A").output === "A";
 *     hex("upper").parse("a").ok === false;
 *     hex("lower").parse("A").ok === false;
 *
 * @param hexCase Hexadecimal case. Default is "both".
 */
export function hex(hexCase: HexCase = "both"): HexParser {
  return {
    hexCase,
    parse(input, context) {
      const charCode = input.charCodeAt(0);

      if (charCode >= 48 && charCode <= 57) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Digit,
          context,
        };
      }

      const { hexCase } = this;
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
    },
  };
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
 *     alpha().parse("m").output === "m";
 *     alpha().parse("M").output === "M";
 */
export function alpha(): IParser<
  LowerAlpha | UpperAlpha,
  ErrorKind.Alphabet,
  string
> {
  return {
    parse(input, context) {
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
    },
  };
}

/**
 * Parse a lowercase alphabet character.
 *
 *     lower().parse("m").output === "m";
 *     lower().parse("M").ok === false;
 */
export function lower(): IParser<LowerAlpha, ErrorKind.LowerAlphabet, string> {
  return {
    parse(input, context) {
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
    },
  };
}

/**
 * Parse an uppercase alphabet character.
 *
 *     upper().parse("m").ok === false;
 *     upper().parse("M").output === "M";
 */
export function upper(): IParser<UpperAlpha, ErrorKind.UpperAlphabet, string> {
  return {
    parse(input, context) {
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
    },
  };
}
