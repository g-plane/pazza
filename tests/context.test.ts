import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass } from "./_.ts";
import { context } from "../mod.ts";

Deno.test("context", () => {
  const myContext = { key: "value" };

  assertEquals(context(myContext, pass()).parse(""), {
    ok: true,
    input: "",
    output: undefined,
    context: myContext,
  });
});
