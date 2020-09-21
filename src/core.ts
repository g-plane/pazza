export type Input = string | Uint8Array;

export type Result<I extends Input, Output, Err = unknown> =
  | { ok: true; input: I; output: Output }
  | { ok: false; input: I; error: Err };

export interface IParser<
  Output,
  Err = unknown,
  I extends Input = string,
> {
  parse(input: I): Result<I, Output, Err>;
}

export type ParserInput<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer _, infer _, infer I> ? I : never;
export type ParserOutput<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer O, infer _, Input> ? O : never;
export type ParserError<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer _, infer E, Input> ? E : never;
