import * as esbuild from "esbuild";
import { rmSync } from "node:fs";
import { mainResolve, loadDotEnvDefined } from "./utils.mjs";

const mainDefined = loadDotEnvDefined();

rmSync(mainResolve("build/main"), { recursive: true, force: true });
rmSync(mainResolve("build/Release"), { recursive: true, force: true });

esbuild.build({
  entryPoints: [mainResolve("src/index.ts"), mainResolve("src/preload.ts")],
  bundle: true,
  platform: "node",
  sourcemap: false,
  target: ["node16.13"],
  external: ["electron", "nock", "aws-sdk", "mock-aws-s3"],
  define: {
    ...mainDefined,
  },
  outdir: mainResolve("build/main"),
  loader: { ".png": "file" },
  minify: true,
});
