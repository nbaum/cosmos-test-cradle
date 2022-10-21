const { buildSync } = require("esbuild");
const { readdirSync } = require("fs")

const sharedConfig = {
  bundle: true,
  minify: false,
  external: readdirSync("node_modules"),
  platform: "node",
};

buildSync({
  ...sharedConfig,
  format: "cjs",
  sourcemap: "both",
  entryPoints: [
    "src/main.ts",
    "src/main.test.ts",
  ],
  outdir: "dist",
})
