import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("src/commands/create-package/templates");
const targetDir = path.resolve("dist/commands/create-package/templates");

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
