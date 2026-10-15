import ts from "/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/typescript/lib/typescript.js";
import { writeFileSync } from "node:fs";
const cfg = ts.readConfigFile("/home/elpresidank/YeeBois/projects/beep-effect2/tsconfig.base.json", ts.sys.readFile);
const plugins = cfg.config.compilerOptions.plugins;
plugins[0].diagnosticSeverity.preferEffectArray = "error";
plugins[0].diagnosticSeverity.preferEffectRecord = "error";
writeFileSync("/home/elpresidank/YeeBois/projects/beep-effect2/scratchpad/effected/.canary/.probe-tmp/tsconfig.json", JSON.stringify({ extends: "../../../tsconfig.json", include: ["../../xdg/**/*.ts"], compilerOptions: { plugins } }, null, 2));
console.log("ok", Object.keys(plugins[0].diagnosticSeverity).length);
