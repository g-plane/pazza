import type { IParser, Result } from "./core.ts";
import { ErrorKind } from "./error.ts";
import { map } from "./combinator.ts";
import { serial } from "./sequence.ts";

const positionCtxSymbol = Symbol("positionContext");

/**
 * Cursor position information.
 */
export type Position = {
  /** Offset from the start of the source. It starts from 0. */
  offset: number;
  /** Line number, which starts from 1. */
  line: number;
  /** Column number, which starts from 0. */
  column: number;
};

type PositionContext = {
  [K in typeof positionCtxSymbol]: {
    position: Position;
    lastInput: string;
  };
};

/**
 * Execute the embedded parser with a new "position context".
 * This parser is required if you're going to
 * use `position` parser or `spanned` parser.
 *
 * @param parser embedded parser
 */
export function withPositionCtx<O, E, CtxIn, CtxOut>(
  parser: IParser<O, E, string, CtxIn, CtxOut>,
): IParser<
  O,
  E,
  string,
  Omit<CtxIn, typeof positionCtxSymbol>,
  CtxOut & PositionContext
> {
  function parse<C extends CtxIn>(
    input: string,
    context: C = Object.create(null),
  ): Result<string, O, E, C & CtxOut & PositionContext> {
    const positionCtx: PositionContext = {
      [positionCtxSymbol]: {
        position: {
          offset: 0,
          line: 1,
          column: 0,
        },
        lastInput: input,
      },
    };

    return parse.parser(input, Object.assign(context, positionCtx));
  }
  parse.parser = parser;

  return parse;
}

/**
 * Retrieve current position, stored as parser output.
 *
 * This parser requires "position context".
 */
export function position(): IParser<
  Position,
  ErrorKind.MissingPositionContext,
  string,
  PositionContext
> {
  return <C extends PositionContext>(
    input: string,
    context?: C,
  ): Result<
    string,
    Position,
    ErrorKind.MissingPositionContext,
    C
  > => {
    if (!context?.[positionCtxSymbol]) {
      return {
        ok: false,
        input,
        error: ErrorKind.MissingPositionContext,
        context: context!,
      };
    }

    const ctx = context[positionCtxSymbol];
    const position = Object.assign({}, ctx.position);

    const consumed = ctx.lastInput.slice(
      0,
      ctx.lastInput.length - input.length,
    );
    const offset = consumed.length;
    position.offset += offset;

    const lines = consumed.split(/\r?\n/);
    if (lines.length === 1) {
      position.column += offset;
    } else {
      const lastIndex = lines.length - 1;
      position.line += lastIndex;
      position.column = lines[lastIndex].length;
    }

    return {
      ok: true,
      input,
      output: position,
      context: Object.assign(
        {},
        context,
        { [positionCtxSymbol]: { position, lastInput: input } },
      ),
    };
  };
}

/**
 * Span contains the parsed value,
 * together with the start position and end position.
 */
export type Span<T> = {
  /** Parsed value. */
  value: T;
  /** Start position. (Inclusive) */
  start: Position;
  /** End position. (Exclusive) */
  end: Position;
};

/**
 * Execute the embedded parser,
 * while remembering the start position and end postion.
 *
 * It will return a `Span<T>` wrapper type, if succeeds.
 *
 * This parser requires "position context".
 *
 * @param parser embedded parser
 */
export function spanned<O, E, CtxIn, CtxOut>(
  parser: IParser<O, E, string, CtxIn, CtxOut>,
): IParser<
  Span<O>,
  E | ErrorKind.MissingPositionContext,
  string,
  CtxIn & PositionContext,
  CtxOut
> {
  return map(
    serial(position(), parser, position()),
    ([start, value, end]) => ({ value, start, end }),
  );
}
