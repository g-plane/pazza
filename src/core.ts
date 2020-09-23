export type Input = string | Uint8Array;

export type Result<I extends Input, Output, Err = unknown, C = never> =
  | { ok: true; input: I; output: Output; context: C }
  | { ok: false; input: I; error: Err; context: C };

export interface IParser<
  Output,
  Err = unknown,
  I extends Input = string,
  Ctx = unknown,
> {
  parse<C extends Ctx = Ctx>(
    input: I,
    context?: C,
  ): Result<I, Output, Err, C | undefined>;
}

export type ParserInput<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer _, infer _, infer I> ? I : never;
export type ParserOutput<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer O, infer _, Input> ? O : never;
export type ParserError<P extends IParser<unknown, unknown, Input>> = P extends
  IParser<infer _, infer E, Input> ? E : never;
