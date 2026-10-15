import ts from "/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/typescript/lib/typescript.js";
import { writeFileSync } from "node:fs";
const root = "/home/elpresidank/YeeBois/projects/beep-effect2";
const base = () => ts.readConfigFile(`${root}/tsconfig.base.json`, ts.sys.readFile).config.compilerOptions.plugins;
const write = (name: string, include: string[], mutate: (p: any) => void) => {
  const plugins = base(); mutate(plugins[0]);
  writeFileSync(`${root}/scratchpad/effected/.canary/.probe-tmp/${name}`, JSON.stringify({ extends: "../../../tsconfig.json", include, compilerOptions: { plugins } }, null, 2));
};
const sev = { preferEffectArray: "error", preferEffectRecord: "error" };
// A: pinned exit-code probe on clean semver, rules at root
write("a.json", ["../../semver/**/*.ts", "../../../test/semver/**/*.ts"], (p) => { Object.assign(p.diagnosticSeverity, sev); });
// B1/B2: override scoping probes on xdg + its tests
write("b1.json", ["../../xdg/**/*.ts", "../../../test/xdg/**/*.ts"], (p) => { p.overrides = [{ include: ["effected/**/*.ts"], options: { diagnosticSeverity: sev } }]; });
write("b2.json", ["../../xdg/**/*.ts", "../../../test/xdg/**/*.ts"], (p) => { p.overrides = [{ include: ["**/effected/**/*.ts"], options: { diagnosticSeverity: sev } }]; });
// C: whole lab sources, rules at root
write("c.json", ["../../**/*.ts"], (p) => { Object.assign(p.diagnosticSeverity, sev); });
console.log("written");
