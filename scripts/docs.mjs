import * as Fs from "node:fs";
import * as Path from "node:path";

function findPackages() {
  const packages = [];

  // Check packages/
  if (Fs.existsSync("packages")) {
    Fs.readdirSync("packages")
      .filter((pkg) => Fs.existsSync(Path.join("packages", pkg, "docs/modules")))
      .forEach((pkg) => packages.push({ dir: "packages", name: pkg }));
  }

  // Check tooling/
  if (Fs.existsSync("tooling")) {
    Fs.readdirSync("tooling")
      .filter((pkg) => Fs.existsSync(Path.join("tooling", pkg, "docs/modules")))
      .forEach((pkg) => packages.push({ dir: "tooling", name: pkg }));
  }

  // Check apps/
  if (Fs.existsSync("apps")) {
    Fs.readdirSync("apps")
      .filter((pkg) => Fs.existsSync(Path.join("apps", pkg, "docs/modules")))
      .forEach((pkg) => packages.push({ dir: "apps", name: pkg }));
  }

  return packages;
}

function pkgName(dir, pkg) {
  const packageJson = Fs.readFileSync(Path.join(dir, pkg, "package.json"));
  return JSON.parse(packageJson).name;
}

function copyFiles(dir, pkg) {
  const name = pkgName(dir, pkg);
  const docs = Path.join(dir, pkg, "docs/modules");
  const dest = Path.join("docs", pkg);
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

      const content = Fs.readFileSync(path, "utf8").replace(/^parent: Modules$/m, `parent: "${name}"`);
      Fs.writeFileSync(destPath, content);
    }
  }

  Fs.rmSync(dest, { recursive: true, force: true });
  Fs.mkdirSync(dest, { recursive: true });
  handleFiles("", files);
}

function generateIndex(pkg, name, order) {
  const content = `---
title: "${name}"
has_children: true
permalink: /docs/${pkg}
nav_order: ${order}
---
`;

  Fs.writeFileSync(Path.join("docs", pkg, "index.md"), content);
}

const packages = findPackages();

packages.forEach(({ dir, name }, i) => {
  const pkgName_ = pkgName(dir, name);
  Fs.rmSync(Path.join("docs", name), { recursive: true, force: true });
  Fs.mkdirSync(Path.join("docs", name), { recursive: true });
  copyFiles(dir, name);
  generateIndex(name, pkgName_, i + 2);
  console.log(`✅ Processed docs for ${pkgName_}`);
});

console.log(`\n✅ Aggregated docs from ${packages.length} packages`);
