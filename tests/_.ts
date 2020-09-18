import type { IParser } from "../mod.ts";

export function pass<T>(output?: T): IParser<T> {
  return {
    parse(_) {
      return {
        ok: true,
        input: "",
        output,
      };
    },
  } as IParser<T>;
}

export function fail<T>(): IParser<T, string> {
  return {
    parse(input) {
      return {
        ok: false,
        input,
        error: "Fake parsing error.",
      };
    },
  };
}
