import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  withPositionCtx,
  position,
  spanned,
  prefix,
  string,
  ErrorKind,
  Result,
} from "../mod.ts";

function omitPositionContext(
  result: Result<string, unknown, unknown, Record<string | symbol, unknown>>,
) {
  const ctx = result.context;
  result.context = Object.keys(ctx).reduce(
    (obj, key) => Object.assign(obj, { [key]: ctx[key] }),
    {},
  );

  return result;
}

Deno.test("position", () => {
  assertEquals(position()(""), {
    ok: false,
    input: "",
    error: ErrorKind.MissingPositionContext,
    context: undefined,
  });

  assertEquals(omitPositionContext(withPositionCtx(position())("", {})), {
    ok: true,
    input: "",
    output: {
      offset: 0,
      line: 1,
      column: 0,
    },
    context: {},
  });

  assertEquals(
    omitPositionContext(
      withPositionCtx(prefix(string("abc"), position()))("abcd", {}),
    ),
    {
      ok: true,
      input: "d",
      output: {
        offset: 3,
        line: 1,
        column: 3,
      },
      context: {},
    },
  );

  assertEquals(
    omitPositionContext(
      withPositionCtx(prefix(string("ab\r\nc"), position()))("ab\r\ncd", {}),
    ),
    {
      ok: true,
      input: "d",
      output: {
        offset: 5,
        line: 2,
        column: 1,
      },
      context: {},
    },
  );

  assertEquals(
    omitPositionContext(
      withPositionCtx(prefix(string("ab\rc"), position()))("ab\rcd", {}),
    ),
    {
      ok: true,
      input: "d",
      output: {
        offset: 4,
        line: 1,
        column: 4,
      },
      context: {},
    },
  );
});

Deno.test("spanned", () => {
  assertEquals(
    omitPositionContext(withPositionCtx(spanned(string("abc")))("abcd", {})),
    {
      ok: true,
      input: "d",
      output: {
        value: "abc",
        start: {
          offset: 0,
          line: 1,
          column: 0,
        },
        end: {
          offset: 3,
          line: 1,
          column: 3,
        },
      },
      context: {},
    },
  );

  assertEquals(
    omitPositionContext(
      withPositionCtx(spanned(string("ab\nc")))("ab\ncd", {}),
    ),
    {
      ok: true,
      input: "d",
      output: {
        value: "ab\nc",
        start: {
          offset: 0,
          line: 1,
          column: 0,
        },
        end: {
          offset: 4,
          line: 2,
          column: 1,
        },
      },
      context: {},
    },
  );
});
