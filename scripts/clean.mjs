import * as Fs from "node:fs";
import * as Path from "node:path";

function findDirs(base) {
  if (!Fs.existsSync(base)) return [];
  return Fs.readdirSync(base, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => Path.join(base, dirent.name));
}

const dirs = [".", ...findDirs("packages"), ...findDirs("tooling"), ...findDirs("apps")];

dirs.forEach((pkg) => {
  const files = [".tsbuildinfo", "tsconfig.tsbuildinfo", "docs", "build", "dist", "coverage"];

  files.forEach((file) => {
    // Don't delete root docs directory
    if (pkg === "." && file === "docs") {
      return;
    }

    const target = Path.join(pkg, file);
    if (Fs.existsSync(target)) {
      Fs.rmSync(target, { recursive: true, force: true });
    }
  });
});

// Clean docs subdirectories (but keep root docs/)
if (Fs.existsSync("docs")) {
  Fs.readdirSync("docs", { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dir) => {
      Fs.rmSync(Path.join("docs", dir.name), { recursive: true, force: true });
    });
}

console.log("✅ Cleaned build artifacts");
