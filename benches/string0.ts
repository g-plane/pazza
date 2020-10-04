import {
  runBenchmarks,
  bench,
} from "https://deno.land/std@0.71.0/testing/bench.ts";
import { many0, map, string0, digit } from "../mod.ts";

const text = new Array(500).fill(0).map(() => ~~(Math.random() * 10)).join("");

const listParser = map(many0(digit()), (chars) => chars.join(""));
const concatParser = string0(digit());

const runs = 1000000;

bench({
  name: "list",
  runs,
  func: (b) => {
    b.start();
    listParser(text);
    b.stop();
  },
});

bench({
  name: "concat",
  runs,
  func: (b) => {
    b.start();
    concatParser(text);
    b.stop();
  },
});

runBenchmarks();
