/* eslint-disable import/no-extraneous-dependencies, no-console */
import * as babel from "@babel/core";
import { promises as fs } from "fs";
import { glob } from "glob";

(async function main() {
  // Clear the build folder
  await fs.rm("./build", { recursive: true, force: true });
  await fs.mkdir("./build");

  // Copy files to build folder
  await Promise.all(
    ["package.json", "LICENSE", "README.md"].map(file =>
      fs.copyFile(file, `build/${file}`)
    )
  );

  // Transpile for Node (except the browser entrypoint)
  // In Babel, setting sourceMaps: true seems like it should produce external
  // source maps and link them:
  // https://babeljs.io/docs/options#source-map-options
  // But it doesn't:
  // https://github.com/babel/babel/issues/5261
  // You can only produce external sourcemaps using the CLI, so I write
  // the maps to file myself and append a reference in the transpiled source
  const srcFiles = await glob("*.js", { cwd: "src" });
  await Promise.all(
    srcFiles.map(file =>
      (async () => {
        console.log(`Transpiling ${file}`);

        // Transpile and produce source maps
        const transpile = await babel.transformFileAsync(`src/${file}`, {
          presets: [["@babel/preset-env"]],
          plugins: ["add-module-exports"], // No .default()
          sourceMaps: true,
          sourceRoot: "../src"
        });

        // Write transpiled source
        await fs.writeFile(
          `build/${file}`,
          `${transpile.code}\n//# sourceMappingURL=${file}.map\n`
        );

        // Write source maps
        await fs.writeFile(
          `build/${file}.map`,
          JSON.stringify(Object.assign(transpile.map, { file }))
        );
      })()
    )
  );

  console.log("Done");
})();
