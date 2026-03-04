import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("src/commands/CreatePackage/templates");
const targetDir = path.resolve("dist/commands/CreatePackage/templates");

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
