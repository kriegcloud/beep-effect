import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Data } from "effect";

const startMarker = "// <generated:migration-bundle>";
const endMarker = "// </generated:migration-bundle>";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceFolder = join(root, "packages/_internal/db-admin/drizzle");
const targetFile = join(root, "apps/professional-desktop/src/runtime/Migrations.ts");
const mode = Bun.argv.includes("--check") ? "check" : "write";

class MissingMigrationBundleMarkers extends Data.TaggedError("MissingMigrationBundleMarkers")<{
  readonly message: string;
  readonly targetFile: string;
}> {}

class StaleMigrationBundle extends Data.TaggedError("StaleMigrationBundle")<{
  readonly command: string;
  readonly message: string;
}> {}

const quoteTemplateLiteral = (value: string): string =>
  `\`${value.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${")}\``;

const readMigrationBundle = async (): Promise<string> => {
  const entries = await readdir(sourceFolder, { withFileTypes: true });
  const migrations = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => ({
        name: entry.name,
        sql: await readFile(join(sourceFolder, entry.name, "migration.sql"), "utf8"),
      }))
  );
  const sortedMigrations = migrations.toSorted((left, right) => left.name.localeCompare(right.name));
  const lines = [
    startMarker,
    "const MigrationBundle: ReadonlyArray<MigrationFile> = [",
    ...sortedMigrations.flatMap((migration) => [
      "  {",
      `    name: ${JSON.stringify(migration.name)},`,
      `    sql: ${quoteTemplateLiteral(migration.sql)},`,
      "  },",
    ]),
    "];",
    endMarker,
  ];

  return lines.join("\n");
};

const replaceGeneratedRegion = (source: string, generatedRegion: string): string => {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker, startIndex);
  if (startIndex === -1 || endIndex === -1) {
    throw new MissingMigrationBundleMarkers({
      message: `Missing generated migration bundle markers in ${targetFile}.`,
      targetFile,
    });
  }

  return `${source.slice(0, startIndex)}${generatedRegion}${source.slice(endIndex + endMarker.length)}`;
};

const source = await readFile(targetFile, "utf8");
const generatedRegion = await readMigrationBundle();
const nextSource = replaceGeneratedRegion(source, generatedRegion);

if (nextSource !== source) {
  if (mode === "check") {
    const command = "bun run --cwd apps/professional-desktop codegen";
    throw new StaleMigrationBundle({
      command,
      message: `Professional Desktop migration bundle is stale. Run \`${command}\`.`,
    });
  }

  await writeFile(targetFile, nextSource);
}
