export type Input = string | Uint8Array

export type Ok<I extends Input, O, C> = {
  ok: true
  input: I
  output: O
  context: C
}
export type Err<I extends Input, E, C> = {
  ok: false
  input: I
  error: E
  context: C
}
export type Result<I extends Input, Output, E, C> =
  | Ok<I, Output, C>
  | Err<I, E, C>

export interface IParser<
  Output,
  Err = unknown,
  I extends Input = string,
  CtxIn = unknown,
  CtxOut = unknown
> {
  (input: I): Result<I, Output, Err, Record<never, never>>
  <C extends CtxIn>(input: I, context: C): Result<I, Output, Err, C & CtxOut>
}

export interface IAlwaysOkParser<
  Output,
  I extends Input = string,
  CtxIn = unknown,
  CtxOut = unknown
> extends IParser<Output, never, I, CtxIn, CtxOut> {
  (input: I): Ok<I, Output, Record<never, never>>
  <C extends CtxIn>(input: I, context: C): Ok<I, Output, C & CtxOut>
}
