import {
  assertEquals,
  assertNotStrictEquals,
} from "https://deno.land/std@0.70.0/testing/asserts.ts";
import {
  Context,
  contextedParserWithImmer,
  contextedParserWithUnistore,
} from "./context_management.ts";

const text = "[1,2,2,4,6,3,6,3,9,3,2,3,7,5,3]";

Deno.test("contextManagement", () => {
  const context: Context = {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
  };

  const result1 = contextedParserWithImmer().parse(text);
  assertNotStrictEquals(result1.context, context);
  assertEquals(result1, {
    ok: true,
    input: "",
    output: [
      "1",
      "2",
      "2",
      "4",
      "6",
      "3",
      "6",
      "3",
      "9",
      "3",
      "2",
      "3",
      "7",
      "5",
      "3",
    ],
    context: {
      "0": 0,
      "1": 1,
      "2": 3,
      "3": 5,
      "4": 1,
      "5": 1,
      "6": 2,
      "7": 1,
      "8": 0,
      "9": 1,
    },
  });

  const result2 = contextedParserWithUnistore().parse(text);
  assertNotStrictEquals(result2.context.getState(), context);
  assertEquals({ ...result2, context: result2.context.getState() }, {
    ok: true,
    input: "",
    output: [
      "1",
      "2",
      "2",
      "4",
      "6",
      "3",
      "6",
      "3",
      "9",
      "3",
      "2",
      "3",
      "7",
      "5",
      "3",
    ],
    context: {
      "0": 0,
      "1": 1,
      "2": 3,
      "3": 5,
      "4": 1,
      "5": 1,
      "6": 2,
      "7": 1,
      "8": 0,
      "9": 1,
    },
  });
});
