import ts from "/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/typescript/lib/typescript.js";
import { writeFileSync } from "node:fs";
const root = "/home/elpresidank/YeeBois/projects/beep-effect2";
const base = () => ts.readConfigFile(`${root}/tsconfig.base.json`, ts.sys.readFile).config.compilerOptions.plugins;
const sev = { preferEffectArray: "error", preferEffectRecord: "error" };
// A2: pinned exit-code with ignoreEffectSuggestionsInTscExitCode
{ const plugins = base(); Object.assign(plugins[0].diagnosticSeverity, sev); plugins[0].ignoreEffectSuggestionsInTscExitCode = true;
  writeFileSync(`${root}/${"scratchpad/effected/.canary/.probe-tmp"}/a2.json`, JSON.stringify({ extends: "../../../tsconfig.json", include: ["../../semver/**/*.ts", "../../../test/semver/**/*.ts"], compilerOptions: { plugins } }, null, 2)); }
// D: real layout lab tsconfig with override include ["**/*.ts"]
{ const plugins = base(); plugins[0].overrides = [{ include: ["**/*.ts"], options: { diagnosticSeverity: sev } }];
  writeFileSync(`${root}/scratchpad/effected/tsconfig.lab.json`, JSON.stringify({ extends: "../tsconfig.json", compilerOptions: { plugins } }, null, 2));
  writeFileSync(`${root}/${"scratchpad/effected/.canary/.probe-tmp"}/d.json`, JSON.stringify({ extends: "../../tsconfig.lab.json", include: ["../../xdg/**/*.ts", "../../../test/xdg/**/*.ts"] }, null, 2)); }
console.log("written");
