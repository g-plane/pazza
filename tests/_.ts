import type { IParser } from "../mod.ts";

export function pass<T>(output?: T): IParser<T> {
  return {
    parse(_, context) {
      return {
        ok: true,
        input: "",
        output,
        context,
      };
    },
  } as IParser<T>;
}

export function fail<T>(): IParser<T, string> {
  return {
    parse(input, context) {
      return {
        ok: false,
        input,
        error: "Fake parsing error.",
        context,
      };
    },
  };
}
