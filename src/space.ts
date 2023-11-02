import type { IParser, Input, Result } from './core.js'
import { ErrorKind } from './error.js'

/**
 * Parse a single "space" character.
 *
 *     space()(" ").output === " ";
 */
export function space(): IParser<' ', ErrorKind.Space, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, ' ', ErrorKind.Space, C> => {
    if (input.charCodeAt(0) === 32) {
      return {
        ok: true,
        input: input.slice(1),
        output: ' ',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Space,
        context,
      }
    }
  }
}

/**
 * Parse a single "carriage return" character.
 *
 *     cr()("\r").output === "\r";
 */
export function cr(): IParser<'\r', ErrorKind.CarriageReturn, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, '\r', ErrorKind.CarriageReturn, C> => {
    if (input.charCodeAt(0) === 13) {
      return {
        ok: true,
        input: input.slice(1),
        output: '\r',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.CarriageReturn,
        context,
      }
    }
  }
}

/**
 * Parse a single "line feed" character.
 *
 *     lf()("\n").output === "\n";
 */
export function lf(): IParser<'\n', ErrorKind.LineFeed, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, '\n', ErrorKind.LineFeed, C> => {
    if (input.charCodeAt(0) === 10) {
      return {
        ok: true,
        input: input.slice(1),
        output: '\n',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.LineFeed,
        context,
      }
    }
  }
}

/**
 * Parse paired "carriage return - line feed" characters.
 *
 *     crlf()("\r\n").output === "\r\n";
 */
export function crlf(): IParser<
  '\r\n',
  ErrorKind.CarriageReturnLineFeed,
  string
> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, '\r\n', ErrorKind.CarriageReturnLineFeed, C> => {
    if (input.charCodeAt(0) === 13 && input.charCodeAt(1) === 10) {
      return {
        ok: true,
        input: input.slice(2),
        output: '\r\n',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.CarriageReturnLineFeed,
        context,
      }
    }
  }
}

/**
 * Parse linebreak, which can be "\n" or "\r\n".
 *
 *     linebreak()("\n").output === "\n";
 *     linebreak()("\r\n").output === "\r\n";
 */
export function linebreak(): IParser<
  '\n' | '\r\n',
  ErrorKind.Linebreak,
  string
> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, '\n' | '\r\n', ErrorKind.Linebreak, C> => {
    const firstCharCode = input.charCodeAt(0)
    if (firstCharCode === 10) {
      return {
        ok: true,
        input: input.slice(1),
        output: '\n',
        context,
      }
    } else if (firstCharCode === 13 && input.charCodeAt(1) === 10) {
      return {
        ok: true,
        input: input.slice(2),
        output: '\r\n',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Linebreak,
        context,
      }
    }
  }
}

/**
 * Parse a single "tab" character.
 *
 *     tab()("\t").output === "\t";
 */
export function tab(): IParser<'\t', ErrorKind.Tab, string> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, '\t', ErrorKind.Tab, C> => {
    if (input.charCodeAt(0) === 9) {
      return {
        ok: true,
        input: input.slice(1),
        output: '\t',
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Tab,
        context,
      }
    }
  }
}

/**
 * Unicode whitespace.
 *
 * @see https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
type Whitespace =
  | '\u0009'
  | '\u000A'
  | '\u000B'
  | '\u000C'
  | '\u000D'
  | '\u0020'
  | '\u0085'
  | '\u00A0'
  | '\u1680'
  | '\u2000'
  | '\u2001'
  | '\u2002'
  | '\u2003'
  | '\u2004'
  | '\u2005'
  | '\u2006'
  | '\u2007'
  | '\u2008'
  | '\u2009'
  | '\u200A'
  | '\u2028'
  | '\u2029'
  | '\u202F'
  | '\u205F'
  | '\u3000'
const UNICODE_WHITESPACE = [
  0x0009,
  0x000a,
  0x000b,
  0x000c,
  0x000d,
  0x0020,
  0x0085,
  0x00a0,
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
  0x200a,
  0x2028,
  0x2029,
  0x202f,
  0x205f,
  0x3000,
]

/**
 * Parse a Unicode Whitespace character.
 *
 *     whitespace()("\v").output === "\v";
 */
export function whitespace(): IParser<
  Whitespace,
  ErrorKind.Whitespace,
  string
> {
  return <C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, Whitespace, ErrorKind.Whitespace, C> => {
    if (UNICODE_WHITESPACE.includes(input.charCodeAt(0))) {
      return {
        ok: true,
        input: input.slice(1),
        output: input[0] as Whitespace,
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.Whitespace,
        context,
      }
    }
  }
}

/**
 * Trim heading whitespace characters by calling `String.prototype.trim`,
 * then pass the trimmed input to embedded parser.
 *
 *     trim(alpha())(" \f\r\n\ta").output === "a";
 *
 * @param parser embedded parser
 */
export function trim<O, E>(
  parser: IParser<O, E, string>,
): IParser<O, E, string> {
  function parse<C>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, O, E, C> {
    return parse.parser(input.trimStart(), context)
  }
  parse.parser = parser

  return parse
}

/**
 * Expect input is empty, otherwise it produces a parsing error.
 *
 * Input type can be `string` or `Uint8Array`.
 *
 *     eof()("").ok === true;
 *     eof()(Uint8Array.of()).ok === true;
 */
export function eof(): IParser<undefined, ErrorKind.EndOfFile, Input> {
  return <C>(
    input: Input,
    context: C = Object.create(null),
  ): Result<Input, undefined, ErrorKind.EndOfFile, C> => {
    if (input.length === 0) {
      return {
        ok: true,
        input,
        output: undefined,
        context,
      }
    } else {
      return {
        ok: false,
        input,
        error: ErrorKind.EndOfFile,
        context,
      }
    }
  }
}
