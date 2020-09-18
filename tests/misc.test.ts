import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import { pass } from "./_.ts";
import { lazy } from "../mod.ts";

Deno.test("lazy", () => {
  const parser = lazy(() => pass("kumiko"));

  assertEquals(parser.parse(""), {
    ok: true,
    input: "",
    output: "kumiko",
  });
});
