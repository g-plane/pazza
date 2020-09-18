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
