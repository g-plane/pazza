import type { IParser, Input } from "./core.ts";
import { ErrorKind } from "./error.ts";

/**
 * Parse a single "space" character. It outputs a single "space" character.
 *
 *     space().parse(" ").output === " ";
 */
export function space(): IParser<" ", ErrorKind.Space, string> {
  return {
    parse(input) {
      if (input.charCodeAt(0) === 32) {
        return {
          ok: true,
          input: input.slice(1),
          output: " ",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Space,
        };
      }
    },
  };
}

/**
 * Parse a single "carriage return" character. It outputs a "carriage return" character.
 *
 *     cr().parse("\r").output === "\r";
 */
export function cr(): IParser<"\r", ErrorKind.CarriageReturn, string> {
  return {
    parse(input) {
      if (input.charCodeAt(0) === 13) {
        return {
          ok: true,
          input: input.slice(1),
          output: "\r",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.CarriageReturn,
        };
      }
    },
  };
}

/**
 * Parse a single "line feed" character. It outputs a "line feed" character.
 *
 *     lf().parse("\n").output === "\n";
 */
export function lf(): IParser<"\n", ErrorKind.LineFeed, string> {
  return {
    parse(input) {
      if (input.charCodeAt(0) === 10) {
        return {
          ok: true,
          input: input.slice(1),
          output: "\n",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.LineFeed,
        };
      }
    },
  };
}

/**
 * Parse paired "carriage return - line feed" characters.
 * It outputs "carriage return - line feed" characters.
 *
 *     crlf().parse("\r\n").output === "\r\n";
 */
export function crlf(): IParser<
  "\r\n",
  ErrorKind.CarriageReturnLineFeed,
  string
> {
  return {
    parse(input) {
      if (input.charCodeAt(0) === 13 && input.charCodeAt(1) === 10) {
        return {
          ok: true,
          input: input.slice(2),
          output: "\r\n",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.CarriageReturnLineFeed,
        };
      }
    },
  };
}

/**
 * Parse linebreak, which can be "\n" or "\r\n".
 * It outputs linebreak.
 *
 *     linebreak().parse("\n").output === "\n";
 *     linebreak().parse("\r\n").output === "\r\n";
 */
export function linebreak(): IParser<
  "\n" | "\r\n",
  ErrorKind.Linebreak,
  string
> {
  return {
    parse(input) {
      const firstCharCode = input.charCodeAt(0);
      if (firstCharCode === 10) {
        return {
          ok: true,
          input: input.slice(1),
          output: "\n",
        };
      } else if (firstCharCode === 13 && input.charCodeAt(1) === 10) {
        return {
          ok: true,
          input: input.slice(2),
          output: "\r\n",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Linebreak,
        };
      }
    },
  };
}

/**
 * Parse a single "tab" character. It outputs a "tab" character.
 *
 *     tab().parse("\t").output === "\t";
 */
export function tab(): IParser<"\t", ErrorKind.Tab, string> {
  return {
    parse(input) {
      if (input.charCodeAt(0) === 9) {
        return {
          ok: true,
          input: input.slice(1),
          output: "\t",
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Tab,
        };
      }
    },
  };
}

/**
 * Unicode whitespace.
 *
 * @see https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
type Whitespace =
  | "\u0009"
  | "\u000A"
  | "\u000B"
  | "\u000C"
  | "\u000D"
  | "\u0020"
  | "\u0085"
  | "\u00A0"
  | "\u1680"
  | "\u2000"
  | "\u2001"
  | "\u2002"
  | "\u2003"
  | "\u2004"
  | "\u2005"
  | "\u2006"
  | "\u2007"
  | "\u2008"
  | "\u2009"
  | "\u200A"
  | "\u2028"
  | "\u2029"
  | "\u202F"
  | "\u205F"
  | "\u3000";
const UNICODE_WHITESPACE = [
  0x0009,
  0x000A,
  0x000B,
  0x000C,
  0x000D,
  0x0020,
  0x0085,
  0x00A0,
  0x1680,
  0x2000,
  0x2001,
  0x2002,
  0x2003,
  0x2004,
  0x2005,
  0x2006,
  0x2007,
  0x2008,
  0x2009,
  0x200A,
  0x2028,
  0x2029,
  0x202F,
  0x205F,
  0x3000,
];

/**
 * Parse a Unicode Whitespace character.
 * It outputs the parsed Unicode Whitespace character.
 *
 *     whitespace().parse("\v").output === "\v";
 */
export function whitespace(): IParser<
  Whitespace,
  ErrorKind.Whitespace,
  string
> {
  return {
    parse(input) {
      if (UNICODE_WHITESPACE.includes(input.charCodeAt(0))) {
        return {
          ok: true,
          input: input.slice(1),
          output: input[0] as Whitespace,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.Whitespace,
        };
      }
    },
  };
}

interface TrimParser<O, E> extends IParser<O, E, string> {
  parser: IParser<O, E, string>;
}
/**
 * Trim heading whitespace characters by calling `String.prototype.trim`,
 * then pass the trimmed input to embedded parser.
 *
 *     trim(alpha()).parse(" \f\r\n\ta").output === "a";
 *
 * @param parser embedded parser
 */
export function trim<O, E>(parser: IParser<O, E, string>): TrimParser<O, E> {
  return {
    parser,
    parse(input) {
      return this.parser.parse(input.trimStart());
    },
  };
}

/**
 * Expect input is empty, otherwise it produces a parsing error.
 *
 * Input type can be `string` or `Uint8Array`.
 *
 *     eof().parse("").ok === true;
 *     eof().parse(Uint8Array.of()).ok === true;
 */
export function eof(): IParser<undefined, ErrorKind.EndOfFile, Input> {
  return {
    parse(input) {
      if (input.length === 0) {
        return {
          ok: true,
          input,
          output: undefined,
        };
      } else {
        return {
          ok: false,
          input,
          error: ErrorKind.EndOfFile,
        };
      }
    },
  };
}
