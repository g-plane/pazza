import type { IParser, Input } from "./core.ts";
import { ErrorKind } from "./error.ts";

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

export function trim(): IParser<undefined, never, string> {
  return {
    parse(input) {
      return {
        ok: true,
        input: input.trimLeft(),
        output: undefined,
      };
    },
  };
}

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
