// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.ts",
  output: {
    dir: "lib-modern",
    format: "es",
    sourcemap: true,
  },
  treeshake: {
    moduleSideEffects: false, // shake away the ponyfill
  },
  external: ["web-streams-polyfill/ponyfill"],
  plugins: [
    typescript({ tsconfig: "src/tsconfig.modern.json" }),
    replace({
      values: {
        "process.env.MODERN": "true",
      },
      preventAssignment: true,
    }),
  ],
};
