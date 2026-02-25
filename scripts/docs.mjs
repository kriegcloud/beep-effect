import * as Fs from "node:fs";
import * as Path from "node:path";
import * as Str from "effect/String";


const PACKAGE_ROOTS = ["packages", "tooling", "apps"];
const IGNORED_DIRS = new Set([".git", ".turbo", "node_modules", "dist", "build"]);

function walkRoot(root) {
  const packages = [];

  if (!Fs.existsSync(root)) {
    return packages;
  }

  function walk(relativePath) {
    const packageDir = relativePath.length > 0 ? Path.join(root, relativePath) : root;

    if (Fs.existsSync(Path.join(packageDir, "docs/modules"))) {
      packages.push({
        packageDir,
        outputPath: relativePath
      });
      return;
    }

    const children = Fs.readdirSync(packageDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const child of children) {
      walk(relativePath.length > 0 ? Path.join(relativePath, child) : child);
    }
  }

  walk("");
  return packages;
}

function findPackages() {
  const packages = PACKAGE_ROOTS.flatMap(walkRoot)
    .sort((left, right) => left.outputPath.localeCompare(right.outputPath));

  const duplicateOutputPaths = new Set();
  const seenOutputPaths = new Set();

  for (const pkg of packages) {
    if (seenOutputPaths.has(pkg.outputPath)) {
      duplicateOutputPaths.add(pkg.outputPath);
      continue;
    }
    seenOutputPaths.add(pkg.outputPath);
  }

  if (duplicateOutputPaths.size > 0) {
    throw new Error(`Duplicate docs output paths detected: ${[...duplicateOutputPaths].join(", ")}`);
  }

  return packages;
}

function pkgName(pkg) {
  const packageJson = Fs.readFileSync(Path.join(pkg.packageDir, "package.json"));
  return JSON.parse(packageJson).name;
}

function copyFiles(pkg) {
  const name = pkgName(pkg);
  const docs = Path.join(pkg.packageDir, "docs/modules");
  const dest = Path.join("docs", pkg.outputPath);
  const files = Fs.readdirSync(docs, { withFileTypes: true });

  function handleFiles(root, files) {
    for (const file of files) {
      const path = Path.join(docs, root, file.name);
      const destPath = Path.join(dest, root, file.name);

      if (file.isDirectory()) {
        Fs.mkdirSync(destPath, { recursive: true });
        handleFiles(Path.join(root, file.name), Fs.readdirSync(path, { withFileTypes: true }));
        continue;
      }

      const content = Str.replace(/^parent: Modules$/m, `parent: "${name}"`)(Fs.readFileSync(path, "utf8"));
      Fs.writeFileSync(destPath, content);
    }
  }

  Fs.rmSync(dest, { recursive: true, force: true });
  Fs.mkdirSync(dest, { recursive: true });
  handleFiles("", files);
}

function generateIndex(outputPath, name, order) {
  const permalink = Str.replace(/\\/g, "/")(outputPath);
  const content = `---
title: "${name}"
has_children: true
permalink: /docs/${permalink}
nav_order: ${order}
---
`;

  Fs.writeFileSync(Path.join("docs", outputPath, "index.md"), content);
}

const packages = findPackages();

packages.forEach((pkg, i) => {
  const pkgName_ = pkgName(pkg);
  Fs.rmSync(Path.join("docs", pkg.outputPath), { recursive: true, force: true });
  Fs.mkdirSync(Path.join("docs", pkg.outputPath), { recursive: true });
  copyFiles(pkg);
  generateIndex(pkg.outputPath, pkgName_, i + 2);
  console.log(`✅ Processed docs for ${pkgName_}`);
});

console.log(`\n✅ Aggregated docs from ${packages.length} packages`);
