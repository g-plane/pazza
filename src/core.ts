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
