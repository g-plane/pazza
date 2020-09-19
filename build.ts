import { copy, emptyDir } from "https://deno.land/std@0.70.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.70.0/path/mod.ts";

await emptyDir("dist");
await emptyDir("dist/es");
await emptyDir("dist/cjs");

const [errors, emitted] = await Deno.compile("./mod.ts", undefined, {
  declaration: true,
  sourceMap: true,
  lib: ["es2017"],
});

const nonLibErrors = errors?.filter((error) => {
  return error.fileName &&
    !error.fileName.endsWith(".d.ts");
});
if (nonLibErrors?.length) {
  console.error(nonLibErrors);
  Deno.exit(1);
}

const cwd = Deno.cwd();
await Promise.all(
  Object.entries(emitted).map(async ([url, code]) => {
    if (url.includes(`${cwd}/mod`)) {
      code = code.replaceAll("src/", "").replaceAll(".ts", "");
      const path = url
        .replace("file://", "")
        .replace(`${cwd}/mod`, `${cwd}/dist/es/index`);
      await Deno.writeTextFile(path, code, { create: true });
      return;
    }

    code = code.replaceAll(".ts", "");
    const path = url
      .replace("file://", "")
      .replace(`${cwd}/src`, `${cwd}/dist/es`);
    await Deno.writeTextFile(path, code, { create: true });
  }),
);

for await (const entry of Deno.readDir("src")) {
  let code = await Deno.readTextFile(path.join("src", entry.name));
  code = code.replaceAll(".ts", "");
  await Deno.writeTextFile(path.join("dist", "es", entry.name), code);
}

await Deno.writeTextFile(
  path.join("dist", "es", "index.ts"),
  (await Deno.readTextFile("mod.ts"))
    .replaceAll(".ts", "")
    .replaceAll("src/", ""),
);

const [, emittedCJS] = await Deno.compile("./mod.ts", undefined, {
  module: "commonjs",
  sourceMap: true,
  lib: ["es2017"],
});
await Promise.all(
  Object.entries(emittedCJS).map(async ([url, code]) => {
    if (url.includes(`${cwd}/mod`)) {
      code = code.replaceAll("src/", "").replaceAll(".ts", "");
      const path = url
        .replace("file://", "")
        .replace(`${cwd}/mod`, `${cwd}/dist/cjs/index`);
      await Deno.writeTextFile(path, code, { create: true });
      return;
    }

    code = code.replaceAll(".ts", "");
    const path = url
      .replace("file://", "")
      .replace(`${cwd}/src`, `${cwd}/dist/cjs`);
    await Deno.writeTextFile(path, code, { create: true });
  }),
);
for await (const entry of Deno.readDir(path.join("dist", "es"))) {
  const { name } = entry;
  if (entry.isFile && name.endsWith(".ts")) {
    await copy(path.join("dist", "es", name), path.join("dist", "cjs", name));
  }
}
