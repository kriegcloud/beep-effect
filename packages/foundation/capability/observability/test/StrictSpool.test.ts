import {
  layerStrictOtlp,
  layerStrictSaltFromKey,
  layerStrictSpool,
  layerStrictSpoolSink,
  makeStrictSpool,
  StrictEgressRecord,
  StrictEgressSink,
  StrictGate,
  StrictSalt,
  StrictSpool,
  StrictSpoolError,
  StrictSpoolKey,
  StrictSpoolOptions,
  StrictSpoolSegment,
} from "@beep/observability/strict";
import { it } from "@beep/test-runner";
import { provideScopedLayer } from "@beep/test-utils";
import * as MemoryFileSystem from "@beep/test-utils/MemoryFileSystem";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as ByteSize from "effect/ByteSize";
import * as Effect from "effect/Effect";
import * as Base64 from "effect/encoding/Base64";
import * as FileSystem from "effect/FileSystem";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as OtlpExporter from "effect/observability/OtlpExporter";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { batchCanary } from "./support/StrictGate.batches.ts";
import { demoConfig, layerTestSalt } from "./support/StrictGate.harness.ts";
import type { TelemetryRefusalTag, TelemetryTier } from "@beep/observability/catalog";
import type { RefusalLedger, StrictSpoolOperation } from "@beep/observability/strict";

const spoolDir = "/state/telemetry/spool";
const textDecoder = new TextDecoder();
const decodeSegment = S.decodeUnknownEffect(S.fromJsonString(StrictSpoolSegment));
const encodeSegment = S.encodeEffect(S.fromJsonString(StrictSpoolSegment));

const keyLayer = (epoch: string, fill: number): Layer.Layer<StrictSpoolKey> =>
  Layer.succeed(
    StrictSpoolKey,
    StrictSpoolKey.of({ epoch, protection: "dev-memory", material: Redacted.make(new Uint8Array(32).fill(fill)) })
  );

const defaultKey = keyLayer("1", 7);

// Each test opens its spool in a directory of its own, so tests sharing one
// in-memory volume never see each other's segments.
const spoolWith = (
  directory: string,
  options: { readonly tier?: TelemetryTier; readonly maxBytes?: number } = {},
  key: Layer.Layer<StrictSpoolKey> = defaultKey
) =>
  makeStrictSpool(
    StrictSpoolOptions.make({
      directory,
      tier: options.tier ?? "shape-only",
      ...(options.maxBytes === undefined ? {} : { maxBytes: options.maxBytes }),
    })
  ).pipe(provideScopedLayer(key));

const volume = Layer.mergeAll(MemoryFileSystem.layer, Path.layer);

const countOf = (ledger: RefusalLedger, tag: TelemetryRefusalTag): number =>
  O.getOrElse(HashMap.get(ledger, tag), () => 0);

const segmentFiles = Effect.fnUntraced(function* (directory: string) {
  const fs = yield* FileSystem.FileSystem;
  const entries = yield* fs.readDirectory(directory);
  return A.sort(A.filter(entries, Str.endsWith(".seg")), Order.String);
});

const rewriteSegment = Effect.fnUntraced(function* (
  file: string,
  edit: (segment: StrictSpoolSegment) => StrictSpoolSegment
) {
  const fs = yield* FileSystem.FileSystem;
  const segment = yield* fs.readFileString(file).pipe(Effect.flatMap(decodeSegment));
  yield* fs.writeFileString(file, yield* encodeSegment(edit(segment)));
});

// Records one body through the spool sink over `spool`.
const recordThroughSink = (spool: StrictSpool["Service"], record: StrictEgressRecord) =>
  Effect.flatMap(Effect.service(StrictEgressSink), (sink) => sink.record(record)).pipe(
    provideScopedLayer(layerStrictSpoolSink.pipe(Layer.provide(Layer.succeed(StrictSpool, spool))))
  );

const flipFirstCiphertextByte = (segment: StrictSpoolSegment): StrictSpoolSegment => {
  const bytes = Result.getOrThrow(Base64.decode(segment.ciphertextBase64));
  bytes[0] = (bytes[0] ?? 0) ^ 0xff;
  return StrictSpoolSegment.make({ ...segment, ciphertextBase64: Base64.encode(bytes) });
};

const tracesRecord = StrictEgressRecord.make({ signal: "traces", body: '{"resourceSpans":[{"name":"lookup"}]}' });
const metricsRecord = StrictEgressRecord.make({ signal: "metrics", body: '{"resourceMetrics":[]}' });

describe("StrictSpool", () => {
  it.layer(volume, { timeout: "10 seconds" })((it) => {
    it.effect("replays every appended body byte for byte, oldest first", () =>
      Effect.gen(function* () {
        const spool = yield* spoolWith("/round-trip");
        const first = yield* spool.append(tracesRecord);
        yield* spool.append(metricsRecord);
        const replay = yield* spool.replay;
        expect(HashMap.size(first)).toBe(0);
        expect(replay.records).toEqual([tracesRecord, metricsRecord]);
        expect(HashMap.size(replay.refused)).toBe(0);
      })
    );

    it.effect("writes owner-only files into an owner-only directory and leaves no temporary file", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const spool = yield* spoolWith("/modes/spool");
        yield* spool.append(tracesRecord);
        expect(((yield* fs.stat("/modes/spool")).mode & 0o777).toString(8)).toBe("700");
        const entries = yield* fs.readDirectory("/modes/spool");
        expect(A.filter(entries, Str.includes(".tmp"))).toEqual([]);
        expect(A.length(entries)).toBe(1);
        for (const entry of entries) {
          expect(((yield* fs.stat(`/modes/spool/${entry}`)).mode & 0o777).toString(8)).toBe("600");
        }
      })
    );

    it.effect("refuses a segment whose ciphertext or authenticated header was edited", () =>
      Effect.gen(function* () {
        const spool = yield* spoolWith("/tamper", { tier: "standard" });
        yield* spool.append(tracesRecord);
        yield* spool.append(metricsRecord);
        yield* spool.append(tracesRecord);
        const [first, second] = yield* segmentFiles("/tamper");
        yield* rewriteSegment(`/tamper/${first ?? ""}`, flipFirstCiphertextByte);
        // A stricter tier would pass the tier check, so only the authentication tag can catch it.
        yield* rewriteSegment(`/tamper/${second ?? ""}`, (segment) =>
          StrictSpoolSegment.make({ ...segment, tier: "shape-only" })
        );
        const replay = yield* spool.replay;
        expect(replay.records).toEqual([tracesRecord]);
        expect(countOf(replay.refused, "spool-segment-invalid")).toBe(2);
      })
    );

    it.effect("counts a header edited to a looser tier as invalid, not tier-refused", () =>
      Effect.gen(function* () {
        const spool = yield* spoolWith("/loosened", { tier: "shape-only" });
        yield* spool.append(tracesRecord);
        const [only] = yield* segmentFiles("/loosened");
        // Authentication runs before the tier check, so the edit is caught as tampering.
        yield* rewriteSegment(`/loosened/${only ?? ""}`, (segment) =>
          StrictSpoolSegment.make({ ...segment, tier: "standard" })
        );
        const replay = yield* spool.replay;
        expect(replay.records).toEqual([]);
        expect(countOf(replay.refused, "spool-segment-invalid")).toBe(1);
        expect(countOf(replay.refused, "spool-tier-refused")).toBe(0);
      })
    );

    it.effect("refuses a segment that is not a segment at all", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const spool = yield* spoolWith("/garbage");
        yield* spool.append(tracesRecord);
        yield* fs.writeFileString("/garbage/000000000000000-garbage.seg", "{not json");
        const replay = yield* spool.replay;
        expect(replay.records).toEqual([tracesRecord]);
        expect(countOf(replay.refused, "spool-segment-invalid")).toBe(1);
      })
    );

    it.effect("never replays a segment under a stricter tier than the one it was gated under", () =>
      Effect.gen(function* () {
        const looser = yield* spoolWith("/tiers", { tier: "standard" });
        yield* looser.append(tracesRecord);
        const strict = yield* spoolWith("/tiers", { tier: "shape-only" });
        yield* strict.append(metricsRecord);

        const strictReplay = yield* strict.replay;
        expect(strictReplay.records).toEqual([metricsRecord]);
        expect(countOf(strictReplay.refused, "spool-tier-refused")).toBe(1);

        // The looser tier may read both: a stricter segment is never refused.
        const looserReplay = yield* looser.replay;
        expect(A.length(looserReplay.records)).toBe(2);
        expect(looserReplay.records).toEqual(expect.arrayContaining([tracesRecord, metricsRecord]));
      })
    );

    it.effect("refuses segments sealed under another key epoch", () =>
      Effect.gen(function* () {
        const old = yield* spoolWith("/epochs", {}, keyLayer("1", 7));
        yield* old.append(tracesRecord);
        const rotated = yield* spoolWith("/epochs", {}, keyLayer("2", 9));
        const replay = yield* rotated.replay;
        expect(replay.records).toEqual([]);
        expect(countOf(replay.refused, "spool-segment-invalid")).toBe(1);
      })
    );

    it.effect("evicts the oldest segments past the byte bound and counts every eviction", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const probe = yield* spoolWith("/eviction/probe");
        yield* probe.append(tracesRecord);
        const [probeFile] = yield* fs.readDirectory("/eviction/probe");
        const size = ByteSize.toNumberUnsafe((yield* fs.stat(`/eviction/probe/${probeFile ?? ""}`)).size);

        const spool = yield* spoolWith("/eviction/spool", { maxBytes: (size * 5) >> 1 });
        const bodies = A.map(["one", "two", "six", "ten"], (word) =>
          StrictEgressRecord.make({ signal: "traces", body: `{"resourceSpans":[{"name":"${word}"}]}` })
        );
        const ledgers = yield* Effect.forEach(bodies, (record) => spool.append(record));
        const evicted = A.reduce(ledgers, 0, (total, ledger) => total + countOf(ledger, "spool-evicted"));
        expect(evicted).toBe(2);
        expect((yield* spool.replay).records).toEqual(A.drop(bodies, 2));
        expect(A.length(yield* segmentFiles("/eviction/spool"))).toBe(2);
      })
    );

    it.effect("counts a segment the disk refuses as a write failure through the sink", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const spool = yield* spoolWith("/write-failure/spool");
        yield* fs.remove("/write-failure/spool", { recursive: true });
        const appendError = yield* Effect.flip(spool.append(tracesRecord));
        expect(appendError.operation).toBe("append");
        const ledger = yield* recordThroughSink(spool, tracesRecord);
        expect(countOf(ledger, "spool-write-failed")).toBe(1);
        expect(countOf(ledger, "spool-evicted")).toBe(0);
      })
    );

    it.effect("fails with a typed error when the directory cannot be created", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.makeDirectory("/blocked", { recursive: true });
        yield* fs.writeFileString("/blocked/telemetry", "a file where the directory should be");
        const error = yield* Effect.flip(spoolWith("/blocked/telemetry/spool"));
        expect(error).toBeInstanceOf(StrictSpoolError);
        expect(error.operation satisfies StrictSpoolOperation).toBe("open");
      })
    );
  });
});

describe("layerStrictSpoolSink", () => {
  const failingSpool = Layer.succeed(
    StrictSpool,
    StrictSpool.of({
      append: Effect.fn("FailingSpool.append")(() =>
        Effect.fail(StrictSpoolError.make({ operation: "append", message: "disk full" }))
      ),
      replay: Effect.fail(StrictSpoolError.make({ operation: "replay", message: "disk full" })),
    })
  );

  it.layer(layerStrictSpoolSink.pipe(Layer.provide(failingSpool)), { timeout: "10 seconds" })((it) => {
    it.effect("counts a body the spool cannot write as a write failure, not an eviction", () =>
      Effect.gen(function* () {
        const sink = yield* StrictEgressSink;
        const ledger = yield* sink.record(tracesRecord);
        expect(countOf(ledger, "spool-write-failed")).toBe(1);
        expect(countOf(ledger, "spool-evicted")).toBe(0);
      })
    );
  });
});

describe("layerStrictSaltFromKey", () => {
  const hmac = (key: Uint8Array, value: string) => new Bun.CryptoHasher("sha256", key).update(value).digest("hex");
  const keyedWith = (key: Layer.Layer<StrictSpoolKey>) =>
    Effect.map(Effect.service(StrictSalt), (salt) => salt.keyedHex(new Uint8Array(16), "b7ad6b7169203331")).pipe(
      provideScopedLayer(layerStrictSaltFromKey(hmac).pipe(Layer.provide(key)))
    );

  it.effect("derives one salt per root key, and a different one for another key", () =>
    Effect.gen(function* () {
      const first = yield* keyedWith(keyLayer("1", 7));
      expect(yield* keyedWith(keyLayer("1", 7))).toBe(first);
      expect(yield* keyedWith(keyLayer("2", 9))).not.toBe(first);
      expect(first).toMatch(/^[0-9a-f]{64}$/);
    })
  );
});

const spooledOtlp = layerStrictOtlp(demoConfig()).pipe(
  Layer.provideMerge(layerStrictSpoolSink),
  Layer.provideMerge(layerStrictSpool(StrictSpoolOptions.make({ directory: spoolDir, tier: "shape-only" }))),
  Layer.provide(layerTestSalt),
  Layer.provideMerge(Layer.mergeAll(defaultKey, volume))
);

describe("strict export through the spool", () => {
  it.layer(spooledOtlp, { timeout: "10 seconds" })((it) => {
    it.effect("keeps the canary out of the spool's bytes at rest and out of every replayed body", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* Effect.logError(batchCanary()).pipe(Effect.withSpan("mcp.tool.call.lookup"));
        yield* Effect.void.pipe(Effect.withSpan(`mcp.tool.call.${batchCanary()}`));
        yield* (yield* OtlpExporter.Flusher).flush;

        const names = yield* segmentFiles(spoolDir);
        expect(A.length(names)).toBeGreaterThanOrEqual(3);
        for (const name of names) {
          const atRest = yield* fs.readFile(`${spoolDir}/${name}`);
          expect(Str.includes(batchCanary())(textDecoder.decode(atRest))).toBe(false);
          const segment = yield* decodeSegment(textDecoder.decode(atRest));
          const ciphertext = Result.getOrThrow(Base64.decode(segment.ciphertextBase64));
          expect(Str.includes(batchCanary())(textDecoder.decode(ciphertext))).toBe(false);
          expect(segment.tier).toBe("shape-only");
        }

        const replay = yield* (yield* StrictSpool).replay;
        expect(HashMap.size(replay.refused)).toBe(0);
        expect(A.some(replay.records, (record) => Str.includes(batchCanary())(record.body))).toBe(false);
        expect(
          A.some(replay.records, (record) => record.signal === "traces" && Str.includes('"name":"lookup"')(record.body))
        ).toBe(true);
        const ledger = yield* (yield* StrictGate).ledger;
        expect(countOf(ledger, "spool-evicted")).toBe(0);
      })
    );
  });
});
