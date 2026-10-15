import ts from "/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/typescript/lib/typescript.js";
import { writeFileSync } from "node:fs";
const root = "/home/elpresidank/YeeBois/projects/beep-effect2";
const plugins = ts.readConfigFile(`${root}/tsconfig.base.json`, ts.sys.readFile).config.compilerOptions.plugins;
plugins[0].overrides = [{
  include: ["**/*.ts"],
  options: { diagnosticSeverity: { preferEffectArray: "error", preferEffectRecord: "error" } },
}];
const header = `{
  // The effected lab's tsgo configuration. Every module tsconfig under effected/ extends this file.
  //
  // The plugin block below MIRRORS tsconfig.base.json (an extending tsconfig replaces the whole
  // \`plugins\` array, it cannot merge into it) and adds one thing: the per-file override that turns
  // \`preferEffectArray\` and \`preferEffectRecord\` on for lab sources. The override's include glob
  // resolves relative to this file, so it covers effected/**/*.ts and never scratchpad/test/**.
  // The pinned @effect/tsgo (0.51.1) does not ship either rule and reports them as TS377134
  // unknown-rule warnings; the lab check gate reads the pinned step's verdict from its diagnostics,
  // and the newer editor build the gate also runs enforces them. Re-sync this block whenever
  // tsconfig.base.json's plugin block changes.
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "plugins": `;
const body = JSON.stringify(plugins, null, 2).split("\n").map((l, i) => (i === 0 ? l : "    " + l)).join("\n");
writeFileSync(`${root}/scratchpad/effected/tsconfig.lab.json`, `${header}${body}\n  }\n}\n`);
console.log("written");
