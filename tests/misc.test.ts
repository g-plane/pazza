import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { pass } from "./_.ts";
import { lazy } from "../mod.ts";

Deno.test("lazy", () => {
  const parser = lazy(() => pass("kumiko"));

  assertEquals(parser(""), {
    ok: true,
    input: "",
    output: "kumiko",
    context: {},
  });
});
