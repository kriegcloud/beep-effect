import { syncDataToTsCommand } from "@beep/repo-cli/commands/SyncDataToTs/index";
import { type SyncDataTarget, SyncDataTargetProjection } from "@beep/repo-cli/commands/SyncDataToTs/internal/Models";
import { ISO4217_SOURCE_URL } from "@beep/repo-cli/commands/SyncDataToTs/targets/Iso4217";
import { syncDataTargets } from "@beep/repo-cli/commands/SyncDataToTs/targets/index";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { HttpClient, HttpClientError, HttpClientResponse } from "effect/unstable/http";
import { describe, expect, it } from "vitest";

const runSyncDataToTsCommand = Command.runWith(syncDataToTsCommand, { version: "0.0.0" });
const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const generatedOutputPath = "packages/common/data/src/generated/iso4217.ts" as const;
const csvGeneratedOutputPath = "packages/common/data/src/generated/test-csv.ts" as const;
const csvFixtureSourceUrl = "https://example.com/test.csv" as const;

const iso4217XmlFixture = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ISO_4217 Pblshd="2026-01-01">
  <CcyTbl>
    <CcyNtry>
      <CtryNm>AMERICAN SAMOA</CtryNm>
      <CcyNm>US Dollar</CcyNm>
      <Ccy>USD</Ccy>
      <CcyNbr>840</CcyNbr>
      <CcyMnrUnts>2</CcyMnrUnts>
    </CcyNtry>
    <CcyNtry>
      <CtryNm>UNITED STATES OF AMERICA (THE)</CtryNm>
      <CcyNm>US Dollar</CcyNm>
      <Ccy>USD</Ccy>
      <CcyNbr>840</CcyNbr>
      <CcyMnrUnts>2</CcyMnrUnts>
    </CcyNtry>
    <CcyNtry>
      <CtryNm>BOND MARKETS UNIT EUROPEAN COMPOSITE UNIT (EURCO)</CtryNm>
      <CcyNm IsFund="true">Bond Markets Unit European Composite Unit (EURCO)</CcyNm>
      <Ccy>XBA</Ccy>
      <CcyNbr>955</CcyNbr>
      <CcyMnrUnts>N.A.</CcyMnrUnts>
    </CcyNtry>
    <CcyNtry>
      <CtryNm>ZIMBABWE</CtryNm>
      <CcyNm>Zimbabwe Gold</CcyNm>
      <Ccy>ZWG</Ccy>
      <CcyNbr>924</CcyNbr>
      <CcyMnrUnts>2</CcyMnrUnts>
    </CcyNtry>
    <CcyNtry>
      <CtryNm>ANTARCTICA</CtryNm>
      <CcyNm>No universal currency</CcyNm>
    </CcyNtry>
  </CcyTbl>
</ISO_4217>
`;

const csvFixture = `code,name,notes
USD,US Dollar,"Used in, multiple countries"
EUR,Euro,"Line 1
Line 2"
`;

const makeWebHandlerClient = (handler: (request: Request) => Promise<Response>) =>
  HttpClient.make((request, url) =>
    Effect.tryPromise({
      try: async () => {
        const response = await handler(
          new Request(url.toString(), {
            method: request.method,
            headers: request.headers,
          })
        );
        return HttpClientResponse.fromWeb(request, response);
      },
      catch: (cause) =>
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.TransportError({ request, cause }),
        }),
    })
  );

const makeTextFixtureClient = (sourceUrl: string, content: string, contentType: string) =>
  makeWebHandlerClient(async (request) =>
    request.url === sourceUrl
      ? new Response(content, {
          status: 200,
          headers: {
            "content-type": contentType,
          },
        })
      : new Response("missing", { status: 404 })
  );

const makeIso4217Client = () => makeTextFixtureClient(ISO4217_SOURCE_URL, iso4217XmlFixture, "application/xml");

const makeCsvFixtureClient = () => makeTextFixtureClient(csvFixtureSourceUrl, csvFixture, "text/csv");

const provideIso4217Client = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provideService(HttpClient.HttpClient, makeIso4217Client()));

const provideCsvFixtureClient = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provideService(HttpClient.HttpClient, makeCsvFixtureClient()));

const withTempRepoCommand = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = 0;
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, previousCwd, previousExitCode, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousExitCode, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = previousExitCode ?? 0;
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(Effect.provide(CommandTestLayer));

const withRegisteredTarget = <A, E, R>(target: SyncDataTarget, use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const targets = syncDataTargets as unknown as Array<SyncDataTarget>;
      targets.push(target);
      return targets;
    }),
    () => use,
    (targets) =>
      Effect.sync(() => {
        const index = targets.findIndex((candidate) => candidate.id === target.id);

        if (index >= 0) {
          targets.splice(index, 1);
        }
      })
  );

const readOutputFile = (outputPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const absolutePath = path.join(process.cwd(), outputPath);
    return yield* fs.readFileString(absolutePath);
  });

const outputFileExists = (outputPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    return yield* fs.exists(path.join(process.cwd(), outputPath));
  });

const writeOutputFile = Effect.fn("SyncDataToTsTest.writeOutputFile")(function* (outputPath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.join(process.cwd(), outputPath);
  yield* fs.makeDirectory(path.dirname(absolutePath), { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

const readGeneratedFile = readOutputFile(generatedOutputPath);
const generatedFileExists = outputFileExists(generatedOutputPath);
const writeGeneratedFile = (content: string) => writeOutputFile(generatedOutputPath, content);

const csvTarget: SyncDataTarget = {
  id: "test-csv",
  description: "Fixture CSV target used to verify sync-data-to-ts CSV parsing.",
  sourceUrl: csvFixtureSourceUrl,
  outputPath: csvGeneratedOutputPath,
  format: "csv",
  project: Effect.fn("SyncDataToTsTest.projectCsv")(function* (document) {
    const rows = document as Array<Record<string, string>> & {
      readonly columns?: ReadonlyArray<string>;
    };

    return new SyncDataTargetProjection({
      content: JSON.stringify({
        columns: rows.columns ?? [],
        rows,
      }),
      recordCount: rows.length,
      summary: `${rows.length} csv rows`,
    });
  }),
};

describe("sync-data-to-ts", () => {
  it("writes the generated ISO 4217 module in write mode", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        provideIso4217Client(
          Effect.gen(function* () {
            yield* runSyncDataToTsCommand(["--target", "iso4217"]);

            const content = yield* readGeneratedFile;
            const logs = yield* TestConsole.logLines;

            expect(content).toContain(`export const CurrencyCodeDataPublished = "2026-01-01" as const;`);
            expect(content).toContain(`code: "USD"`);
            expect(content).toContain(`digits: 0`);
            expect(content).toContain(`currency: "Zimbabwe Gold"`);
            expect(content).toContain(`"American Samoa"`);
            expect(content).toContain(`"United States Of America (The)"`);
            expect(content).not.toContain("No universal currency");
            expect(logs).toContain(
              "sync-data-to-ts: updated iso4217 -> packages/common/data/src/generated/iso4217.ts (3 currency entries published 2026-01-01)"
            );
            expect(process.exitCode ?? 0).toBe(0);
          })
        )
      )
    );
  });

  it("does not write files in dry-run mode", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        provideIso4217Client(
          Effect.gen(function* () {
            yield* runSyncDataToTsCommand(["--target", "iso4217", "--dry-run"]);

            const exists = yield* generatedFileExists;
            const logs = yield* TestConsole.logLines;

            expect(exists).toBe(false);
            expect(logs).toContain(
              "sync-data-to-ts: would update iso4217 -> packages/common/data/src/generated/iso4217.ts (3 currency entries published 2026-01-01)"
            );
            expect(process.exitCode ?? 0).toBe(0);
          })
        )
      )
    );
  });

  it("fails check mode on drift without modifying the file", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        provideIso4217Client(
          Effect.gen(function* () {
            yield* writeGeneratedFile("stale-content\n");

            yield* runSyncDataToTsCommand(["--target", "iso4217", "--check"]);

            const content = yield* readGeneratedFile;
            const errors = yield* TestConsole.errorLines;

            expect(content).toBe("stale-content\n");
            expect(errors).toContain(
              'sync-data-to-ts: Detected drift in 1 target(s): iso4217. Run "bun run beep sync-data-to-ts --all" to refresh generated files.'
            );
            expect(process.exitCode).toBe(1);
          })
        )
      )
    );
  });

  it("becomes a no-op when the generated file is already current", async () => {
    await Effect.runPromise(
      withTempRepoCommand(
        provideIso4217Client(
          Effect.gen(function* () {
            yield* runSyncDataToTsCommand(["--target", "iso4217"]);
            yield* runSyncDataToTsCommand(["--target", "iso4217"]);

            const logs = yield* TestConsole.logLines;

            expect(logs).toContain("sync-data-to-ts: wrote 0 of 1 target(s)");
            expect(process.exitCode ?? 0).toBe(0);
          })
        )
      )
    );
  });

  it("parses CSV targets with the canonical @beep/schema CSV implementation", async () => {
    await Effect.runPromise(
      withRegisteredTarget(
        csvTarget,
        withTempRepoCommand(
          provideCsvFixtureClient(
            Effect.gen(function* () {
              yield* runSyncDataToTsCommand(["--target", "test-csv"]);

              const content = yield* readOutputFile(csvGeneratedOutputPath);

              expect(content).toContain(`"columns":["code","name","notes"]`);
              expect(content).toContain(`"code":"USD"`);
              expect(content).toContain(`"notes":"Used in, multiple countries"`);
              expect(content).toContain(`"notes":"Line 1\\nLine 2"`);
              expect(process.exitCode ?? 0).toBe(0);
            })
          )
        )
      )
    );
  });
});
