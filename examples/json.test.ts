import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { jsonValue } from "./json.ts";

Deno.test("jsonParser", () => {
  const result = jsonValue().parse(`
    [
      2,
      -43.21,
      true,
      "test",
      "\\n\\"\\t",
      false,
      {
        "a": "b",
        "c": null
      }
    ]
  `);

  assertEquals(result, {
    ok: true,
    input: "\n  ",
    output: [
      2,
      -43.21,
      true,
      "test",
      '\n"\t',
      false,
      {
        "a": "b",
        "c": null,
      },
    ],
    context: undefined,
  });
});
