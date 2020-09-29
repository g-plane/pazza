import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { digit, map, ErrorKind, IParser, Input } from "../mod.ts";

Deno.test("context", () => {
  const myContext = { key: "value" };

  assertEquals(digit()("5", myContext), {
    ok: true,
    input: "",
    output: "5",
    context: myContext,
  });

  assertEquals(digit()("", myContext), {
    ok: false,
    input: "",
    error: ErrorKind.Digit,
    context: myContext,
  });

  type State = { state: number };
  function requireState<O, E, I extends Input>(
    parser: IParser<O, E, I>,
  ): IParser<O, E, I, State> {
    return <C extends State>(input: I, context: C = Object.create(null)) =>
      parser(input, context);
  }
  function injectState<O, E, I extends Input>(
    parser: IParser<O, E, I>,
  ): IParser<O, E, I, unknown, State> {
    return <C>(input: I, context: C = Object.create(null)) =>
      parser(input, Object.assign(context, {} as State));
  }

  requireState(
    digit(),
    // deno-lint-ignore ban-ts-comment
    // @ts-expect-error
  )("", {});

  const result1 = injectState(requireState(digit()))("", { extra: "" });
  assertEquals(result1.context, { extra: "" });

  const parser2 = map(
    requireState(
      digit(),
    ),
    () => 0,
  );
  // deno-lint-ignore ban-ts-comment
  // @ts-expect-error
  parser2("", {});

  const result2 = injectState(parser2)("", { extra: "" });
  assertEquals(result2.context, { extra: "" });
});
