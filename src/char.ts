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
export function char<C extends string>(char: C): CharParser<C> {
  ensureSingleCharacter(char);

  return {
    char,
    charCode: char.charCodeAt(0),
    parse(input) {
      const { char, charCode } = this;
      if (input.charCodeAt(0) === charCode) {
        return {
          ok: true,
          input: input.slice(1),
          output: char,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Char,
        };
      }
    },
  };
}

export function anyChar(): IParser<string, ErrorKind.AnyChar, string> {
  return {
    parse(input) {
      if (input === "") {
        return {
          ok: false,
          input,
          error: ErrorKind.AnyChar,
        };
      } else {
        return {
          ok: true,
          input: input.slice(1),
          output: input.charAt(0),
        };
      }
    },
  };
}

interface OneOfCharsParser<S extends readonly string[]>
  extends IParser<S[number], ErrorKind.OneOfChars, string> {
  charCodes: number[];
}
export function oneOfChars<S extends readonly string[]>(
  ...chars: S
): OneOfCharsParser<S> {
  chars.forEach(ensureSingleCharacter);

  return {
    charCodes: chars.map((char) => char.charCodeAt(0)),
    parse(input) {
      const { charCodes } = this;
      const firstCharCode = input.charCodeAt(0);

      if (charCodes.includes(firstCharCode)) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0],
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.OneOfChars,
        };
      }
    },
  };
}

interface NoneOfCharsParser
  extends IParser<string, ErrorKind.NoneOfChars, string> {
  charCodes: number[];
}
export function noneOfChars<S extends readonly string[]>(
  ...chars: S
): NoneOfCharsParser {
  chars.forEach(ensureSingleCharacter);

  return {
    charCodes: chars.map((char) => char.charCodeAt(0)),
    parse(input) {
      const { charCodes } = this;
      const firstCharCode = input.charCodeAt(0);
      if (charCodes.includes(firstCharCode)) {
        return {
          ok: false,
          input,
          error: ErrorKind.NoneOfChars,
        };
      } else {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0],
        };
      }
    },
  };
}

interface EscapedWithParser<R extends readonly string[]>
  extends IParser<R[number], ErrorKind.EscapedWith, string> {
  controlCharCode: number;
  charCodes: number[];
}
export function escapedWith<R extends readonly string[]>(
  controlChar: string,
  chars: R,
): EscapedWithParser<R> {
  ensureSingleCharacter(controlChar);
  chars.forEach(ensureSingleCharacter);

  return {
    controlCharCode: controlChar.charCodeAt(0),
    charCodes: chars.map((char) => char.charCodeAt(0)),
    parse(input) {
      const { controlCharCode, charCodes } = this;
      const firstCharCode = input.charCodeAt(0);

      if (firstCharCode === controlCharCode) {
        const secondCharCode = input.charCodeAt(1);
        if (charCodes.includes(secondCharCode)) {
          return {
            ok: true,
            input: input.slice(2),
            output: input[1] as R[number],
          };
        } else {
          return {
            ok: false,
            input,
            error: ErrorKind.EscapedWith,
          };
        }
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedWith,
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
export function escapedBy<V>(
  controlChar: string,
  transformer: (char: string) => V,
): EscapedByParser<V> {
  ensureSingleCharacter(controlChar);

  return {
    controlCharCode: controlChar.charCodeAt(0),
    transformer,
    parse(input) {
      if (input.length < 2) {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedBy,
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
          };
        } else {
          return {
            ok: false,
            input,
            error: ErrorKind.EscapedBy,
          };
        }
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.EscapedBy,
        };
      }
    },
  };
}

interface StringParser<S> extends IParser<S, ErrorKind.String, string> {
  literal: S;
}
export function string<S extends string>(literal: S): StringParser<S> {
  return {
    literal,
    parse(input) {
      const { literal } = this;
      if (input.slice(0, literal.length) === literal) {
        return {
          ok: true,
          input: input.slice(literal.length),
          output: literal,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.String,
        };
      }
    },
  };
}

type OctalDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

export function octal(): IParser<OctalDigit, ErrorKind.Octal, string> {
  return {
    parse(input) {
      const charCode = input.charCodeAt(0);
      if (charCode >= 48 && charCode <= 55) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as OctalDigit,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Octal,
        };
      }
    },
  };
}

type Digit = OctalDigit | "8" | "9";

export function digit(): IParser<Digit, ErrorKind.Digit, string> {
  return {
    parse(input) {
      const charCode = input.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Digit,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Digit,
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
export function hex(hexCase: HexCase = "both"): HexParser {
  return {
    hexCase,
    parse(input) {
      const charCode = input.charCodeAt(0);

      if (charCode >= 48 && charCode <= 57) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Digit,
        };
      }

      const { hexCase } = this;
      if (hexCase === "both") {
        if (charCode >= 65 && charCode <= 70) {
          return {
            ok: true,
            input: input.slice(1),
            output: input[0] as Hexadecimal,
          };
        } else if (charCode >= 97 && charCode <= 102) {
          return {
            ok: true,
            input: input.slice(1),
            output: input[0] as Hexadecimal,
          };
        } else {
          return {
            ok: false,
            input,
            error: ErrorKind.Hex,
          };
        }
      } else if (hexCase === "upper") {
        if (charCode >= 65 && charCode <= 70) {
          return {
            ok: true,
            input: input.slice(1),
            output: input[0] as Hexadecimal,
          };
        } else if (charCode >= 97 && charCode <= 102) {
          return {
            ok: false,
            input,
            error: ErrorKind.UpperHex,
          };
        } else {
          return {
            ok: false,
            input,
            error: ErrorKind.Hex,
          };
        }
      } else {
        if (charCode >= 97 && charCode <= 102) {
          return {
            ok: true,
            input: input.slice(1),
            output: input[0] as Hexadecimal,
          };
        } else if (charCode >= 65 && charCode <= 70) {
          return {
            ok: false,
            input,
            error: ErrorKind.LowerHex,
          };
        } else {
          return {
            ok: false,
            input,
            error: ErrorKind.Hex,
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

export function alpha(): IParser<
  LowerAlpha | UpperAlpha,
  ErrorKind.Alphabet,
  string
> {
  return {
    parse(input) {
      const charCode = input.charCodeAt(0);
      if (
        charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122
      ) {
        return {
          ok: true,
          input: input.slice(1),
          output: input.charAt(0) as LowerAlpha | UpperAlpha,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Alphabet,
        };
      }
    },
  };
}

export function lower(): IParser<LowerAlpha, ErrorKind.LowerAlphabet, string> {
  return {
    parse(input) {
      const charCode = input.charCodeAt(0);
      if (
        charCode >= 97 && charCode <= 122
      ) {
        return {
          ok: true,
          input: input.slice(1),
          output: input.charAt(0) as LowerAlpha,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.LowerAlphabet,
        };
      }
    },
  };
}

export function upper(): IParser<UpperAlpha, ErrorKind.UpperAlphabet, string> {
  return {
    parse(input) {
      const charCode = input.charCodeAt(0);
      if (
        charCode >= 65 && charCode <= 90
      ) {
        return {
          ok: true,
          input: input.slice(1),
          output: input.charAt(0) as UpperAlpha,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.UpperAlphabet,
        };
      }
    },
  };
}
