import type { IParser, Input, Result } from "../mod.ts";

export function pass<T>(output: T): IParser<T, never, Input> {
  return <C>(
    _: Input,
    context: C = Object.create(null),
  ): Result<Input, T, never, C> => {
    return {
      ok: true,
      input: "",
      output,
      context,
    };
  };
}

export function fail<T>(): IParser<T, string, Input> {
  return <C>(
    input: Input,
    context: C = Object.create(null),
  ): Result<Input, T, string, C> => {
    return {
      ok: false,
      input,
      error: "Fake parsing error.",
      context,
    };
  };
}
