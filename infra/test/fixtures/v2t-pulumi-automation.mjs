import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalWorkspace } from "@pulumi/pulumi/automation";

const createFixtureRepo = async (repoRoot) => {
  await mkdir(join(repoRoot, "apps/V2T/scripts"), { recursive: true });
  await mkdir(join(repoRoot, "apps/V2T/src"), { recursive: true });
  await mkdir(join(repoRoot, "apps/V2T/src-tauri/capabilities"), { recursive: true });
  await mkdir(join(repoRoot, "apps/V2T/src-tauri/icons"), { recursive: true });
  await mkdir(join(repoRoot, "apps/V2T/src-tauri/src"), { recursive: true });
  await mkdir(join(repoRoot, "packages/v2t-sidecar/src"), { recursive: true });
  await writeFile(join(repoRoot, ".npmrc"), "@buf:registry=https://buf.build/gen/npm/v1/\n");
  await writeFile(join(repoRoot, "package.json"), '{\n  "name": "@fixture/root"\n}\n');
  await writeFile(
    join(repoRoot, "apps/V2T/components.json"),
    '{\n  "$schema": "https://ui.shadcn.com/schema.json"\n}\n'
  );
  await writeFile(join(repoRoot, "apps/V2T/index.html"), "<!doctype html>\n");
  await writeFile(join(repoRoot, "apps/V2T/package.json"), '{\n  "name": "@fixture/v2t"\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/postcss.config.mjs"), "export default {};\n");
  await writeFile(join(repoRoot, "apps/V2T/scripts/build-sidecar.ts"), "export {};\n");
  await writeFile(join(repoRoot, "apps/V2T/src/main.tsx"), "export {};\n");
  await writeFile(
    join(repoRoot, "apps/V2T/src-tauri/Cargo.toml"),
    '[package]\nname = "fixture-v2t"\nversion = "0.0.0"\n'
  );
  await writeFile(join(repoRoot, "apps/V2T/src-tauri/build.rs"), "fn main() {}\n");
  await writeFile(join(repoRoot, "apps/V2T/src-tauri/capabilities/default.json"), '{\n  "permissions": []\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/src-tauri/icons/icon.png"), "fixture-icon\n");
  await writeFile(join(repoRoot, "apps/V2T/src-tauri/src/main.rs"), "fn main() {}\n");
  await writeFile(join(repoRoot, "apps/V2T/src-tauri/tauri.conf.json"), '{\n  "build": {}\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/tsconfig.build.json"), '{\n  "extends": "../../tsconfig.base.json"\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/tsconfig.json"), '{\n  "extends": "../../tsconfig.base.json"\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/turbo.json"), '{\n  "$schema": "https://turbo.build/schema.json"\n}\n');
  await writeFile(join(repoRoot, "apps/V2T/vite.config.ts"), "export default {};\n");
  await writeFile(join(repoRoot, "packages/v2t-sidecar/package.json"), '{\n  "name": "@fixture/v2t-sidecar"\n}\n');
  await writeFile(join(repoRoot, "packages/v2t-sidecar/src/index.ts"), "export {};\n");
  await writeFile(
    join(repoRoot, "packages/v2t-sidecar/tsconfig.json"),
    '{\n  "extends": "../../tsconfig.base.json"\n}\n'
  );
  await writeFile(
    join(repoRoot, "packages/v2t-sidecar/turbo.json"),
    '{\n  "$schema": "https://turbo.build/schema.json"\n}\n'
  );
  await writeFile(join(repoRoot, "bunfig.toml"), '[install]\nlinker = "hoisted"\n');
  await writeFile(join(repoRoot, "bun.lock"), "fixture-lock\n");
  await writeFile(join(repoRoot, "tsconfig.base.json"), '{\n  "compilerOptions": {}\n}\n');
};

const createFixtureInstallerScript = async (filePath) => {
  const script = `#!/usr/bin/env bash
set -euo pipefail

action="\${1:-}"
log_path="\${BEEP_FIXTURE_LOG_PATH:?}"
repo_root="\${V2T_REPO_ROOT:?}"

printf '%s\\t%s\\t%s\\t%s\\t%s\\n' \
  "$action" \
  "\${V2T_TARGET_USER:-}" \
  "\${V2T_QWEN_STATE_DIR:-}" \
  "\${V2T_GRAPHITI_STATE_DIR:-}" \
  "\${V2T_GRAPHITI_ENABLED:-}" >> "$log_path"

if [[ "$action" == "build-app" ]]; then
  mkdir -p "\${repo_root}/apps/V2T/src-tauri/target/release/bundle/deb"
  printf 'fixture-deb\n' > "\${repo_root}/apps/V2T/src-tauri/target/release/bundle/deb/fixture.deb"
  mkdir -p "\${repo_root}/packages/v2t-sidecar/dist"
  printf 'export {};\n' > "\${repo_root}/packages/v2t-sidecar/dist/index.js"
  printf 'fixture-package\\n'
fi
`;

  await writeFile(filePath, script, { mode: 0o755 });
};

const createFixtureQwenScript = async (filePath) => {
  await writeFile(
    filePath,
    ["#!/usr/bin/env python3", "if __name__ == '__main__':", "    print('fixture-qwen')", ""].join("\n"),
    {
      mode: 0o755,
    }
  );
};

const readLogLines = async (logPath) => {
  try {
    return (await readFile(logPath, "utf8"))
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
};

const tempRoot = await mkdtemp(join(tmpdir(), "beep-infra-automation-"));
const backendDir = join(tempRoot, "pulumi-backend");
const repoRoot = join(tempRoot, "fixture-repo");
const workDir = join(tempRoot, "workspace");
const logPath = join(tempRoot, "installer-actions.log");
const installerScriptPath = join(tempRoot, "fixture-installer.sh");
const qwenScriptPath = join(tempRoot, "fixture-qwen.py");

await mkdir(backendDir, { recursive: true });
await mkdir(workDir, { recursive: true });
await createFixtureRepo(repoRoot);
await createFixtureInstallerScript(installerScriptPath);
await createFixtureQwenScript(qwenScriptPath);
await writeFile(logPath, "");

const originalInstallerScriptPath = process.env.BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH;
const originalQwenScriptPath = process.env.BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH;

process.env.BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH = installerScriptPath;
process.env.BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH = qwenScriptPath;

try {
  const v2tModuleUrl = new URL("../../src/V2T.ts", import.meta.url).href;
  const { V2TWorkstation } = await import(v2tModuleUrl);

  const stack = await LocalWorkspace.createOrSelectStack(
    {
      projectName: "beep-infra-fixture",
      stackName: "dev",
      program: () => {
        const workstation = new V2TWorkstation("fixture", {
          config: {
            repoRoot,
            targetHomeDir: "/home/fixture-user",
            targetUser: "fixture-user",
          },
        });

        return {
          graphitiProxyUrl: workstation.graphitiProxyUrl,
          installedPackageName: workstation.installedPackageName,
          qwenStateDir: workstation.qwenStateDir,
        };
      },
    },
    {
      envVars: {
        BEEP_FIXTURE_LOG_PATH: logPath,
        BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH: installerScriptPath,
        BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH: qwenScriptPath,
        PULUMI_BACKEND_URL: `file://${backendDir}`,
        PULUMI_CONFIG_PASSPHRASE: "fixture-passphrase",
        PULUMI_SKIP_UPDATE_CHECK: "true",
      },
      workDir,
    }
  );

  await stack.preview();
  const logAfterPreview = await readLogLines(logPath);
  const firstUp = await stack.up();
  const logAfterFirstUp = await readLogLines(logPath);
  await stack.up();
  const logAfterSecondUp = await readLogLines(logPath);
  await stack.destroy();
  const logAfterDestroy = await readLogLines(logPath);
  await stack.workspace.removeStack("dev");

  console.log(
    JSON.stringify({
      firstGraphitiProxyUrl: firstUp.outputs.graphitiProxyUrl?.value ?? null,
      firstInstalledPackageName: firstUp.outputs.installedPackageName?.value ?? null,
      firstQwenStateDir: firstUp.outputs.qwenStateDir?.value ?? null,
      logAfterDestroy,
      logAfterFirstUp,
      logAfterPreview,
      logAfterSecondUp,
    })
  );
} finally {
  if (originalInstallerScriptPath === undefined) {
    delete process.env.BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH;
  } else {
    process.env.BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH = originalInstallerScriptPath;
  }

  if (originalQwenScriptPath === undefined) {
    delete process.env.BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH;
  } else {
    process.env.BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH = originalQwenScriptPath;
  }

  await rm(tempRoot, { force: true, recursive: true });
}
