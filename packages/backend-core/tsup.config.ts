import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    compilerOptions: {
      declarationMap: true,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
});
