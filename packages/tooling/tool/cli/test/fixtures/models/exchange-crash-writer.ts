import { $RepoCliId } from "@beep/identity/packages";
import {
  ModelsApply,
  ModelsApplyLive,
  ModelsAtomicExchange,
  makeModelsAtomicExchange,
} from "@beep/repo-cli/commands/Models/Models.apply.service";
import {
  LocatorBinding,
  ModelsApplyJournal,
  ModelsLocatorWrite,
} from "@beep/repo-cli/commands/Models/Models.manifest.schemas";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { BunRuntime } from "@effect/platform-bun";
import { NodeServices } from "@effect/platform-node";
import * as NodeCrypto from "@effect/platform-node-shared/NodeCrypto";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { makeModelsTestExchangeSystem } from "../../helpers/models-atomic-exchange.ts";
import type { ModelsExchangeSystemShape } from "@beep/repo-cli/commands/Models/Models.apply.service";

// A real ModelsApply in its own process, against a disposable target tree. It
// halts at one named crash point and waits for its parent's SIGKILL.
const $I = $RepoCliId.create("test/fixtures/models/exchange-crash-writer");
const Mode = LiteralKit(["apply", "restore", "recover"]).annotate(
  $I.annote("Mode", { description: "Which ModelsApply operation the crash writer runs." })
);
const HaltPoint = LiteralKit([
  "none",
  "intent",
  "backed-up",
  "staged",
  "exchange-returned",
  "exchanged",
  "verified",
  "completed",
  "recovering",
]).annotate(
  $I.annote("HaltPoint", {
    description: "Durable journal state, or the return of the publication exchange, at which the writer halts.",
  })
);
const decodeArguments = S.decodeUnknownEffect(S.Tuple([Mode, S.String, S.String, HaltPoint, S.String]));
const decodeJournal = S.decodeUnknownEffect(S.fromJsonString(ModelsApplyJournal));

const request = ModelsLocatorWrite.make({
  locator: {
    _tag: "toml-top-level-key",
    binding: LocatorBinding.make({ role: "codex.heavy", surface: "codex-cli", field: "model" }),
    render: { _tag: "verbatim" },
    key: "model",
  },
  expected: "gpt-6.1-sol",
});

const main = Effect.gen(function* () {
  const [mode, file, backups, halt, journalId] = yield* decodeArguments(A.drop(process.argv, 2));
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const pause = Console.log(`HALTED ${halt}`).pipe(Effect.andThen(Effect.never));
  // The publication this process owns: the apply's, the restore's, or any
  // publication recovery is reconciling.
  const reached = Effect.fnUntraced(function* (journalFile: string) {
    const journal = yield* fs.readFileString(journalFile).pipe(Effect.flatMap(decodeJournal), Effect.option);
    if (O.isNone(journal)) return false;
    const states = A.map(
      A.getSomes([
        journal.value.publication._tag === "tracked" ? O.some(journal.value.publication) : O.none(),
        journal.value.restoration,
      ]),
      (publication) => publication.state._tag
    );
    return Mode.$match(mode, {
      apply: () => journal.value.publication._tag === "tracked" && journal.value.publication.state._tag === halt,
      restore: () => O.exists(journal.value.restoration, (restoration) => restoration.state._tag === halt),
      recover: () => A.contains(states, halt),
    });
  });
  const afterJournalWrite = Effect.fnUntraced(function* (target: string) {
    if (path.dirname(target) === backups && Str.endsWith(".json")(target) && (yield* reached(target)))
      return yield* pause;
  });
  const halting = FileSystem.FileSystem.of({
    ...fs,
    link: Effect.fn("ExchangeCrashWriter.link")(function* (source, target) {
      yield* fs.link(source, target);
      yield* afterJournalWrite(target);
    }),
    rename: Effect.fn("ExchangeCrashWriter.rename")(function* (source, target) {
      yield* fs.rename(source, target);
      yield* afterJournalWrite(target);
    }),
  });
  const base = yield* makeModelsTestExchangeSystem();
  const system: ModelsExchangeSystemShape = {
    identify: base.identify,
    exchange: (left, right) =>
      base
        .exchange(left, right)
        .pipe(
          Effect.andThen(
            HaltPoint.is["exchange-returned"](halt) && (left === file || right === file) ? pause : Effect.void
          )
        ),
  };
  const capability = yield* makeModelsAtomicExchange(system);
  const writer = Context.get(
    yield* Layer.build(
      ModelsApplyLive.pipe(
        Layer.provide(
          Layer.mergeAll(Layer.succeed(FileSystem.FileSystem, halting), Layer.succeed(ModelsAtomicExchange, capability))
        )
      )
    ),
    ModelsApply
  );
  yield* Mode.$match(mode, {
    apply: () => writer.apply(file, [request], "write", backups).pipe(Effect.asVoid),
    restore: () => writer.restore(path.join(backups, `${journalId}.json`), backups),
    recover: () => writer.recover(backups).pipe(Effect.asVoid),
  });
  yield* Console.log("DONE");
});

const program = Layer.mergeAll(NodeServices.layer, NodeCrypto.layer).pipe(
  Layer.build,
  Effect.flatMap((context) => main.pipe(Effect.provide(context))),
  Effect.scoped
);
BunRuntime.runMain(program);
