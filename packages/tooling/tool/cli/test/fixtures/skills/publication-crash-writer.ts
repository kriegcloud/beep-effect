import { $RepoCliId } from "@beep/identity/packages";
import { ModelsAtomicExchange, makeModelsAtomicExchange } from "@beep/repo-cli/commands/Models/Models.apply.service";
import {
  SkillPublicationFile,
  SkillPublicationJournal,
} from "@beep/repo-cli/commands/Skills/SkillsPublication.schemas";
import { SkillPublisher, SkillPublisherLive } from "@beep/repo-cli/commands/Skills/SkillsPublication.service";
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
import { intendedFile, intendedTree } from "../../helpers/skills-publication.ts";
import type { ModelsExchangeSystemShape } from "@beep/repo-cli/commands/Models/Models.apply.service";

// A real SkillPublisher in its own process, against a disposable repository
// tree. It halts at one named crash point and waits for its parent's SIGKILL.
const $I = $RepoCliId.create("test/fixtures/skills/publication-crash-writer");
const Mode = LiteralKit(["publish-file", "publish-directory", "recover"]).pipe(
  $I.annoteSchema("Mode", { description: "Which SkillPublisher operation the crash writer runs." })
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
]).pipe(
  $I.annoteSchema("HaltPoint", {
    description: "Durable journal state, or the return of the publication exchange, at which the writer halts.",
  })
);
const decodeArguments = S.decodeUnknownEffect(S.Tuple([Mode, S.String, S.String, HaltPoint]));
const decodeJournal = S.decodeUnknownEffect(S.fromJsonString(SkillPublicationJournal));

const main = Effect.gen(function* () {
  const [mode, root, target, halt] = yield* decodeArguments(A.drop(process.argv, 2));
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const journals = path.join(root, ".beep", "skills-backups", "journals");
  const pause = Console.log(`HALTED ${halt}`).pipe(Effect.andThen(Effect.never));
  const reached = Effect.fnUntraced(function* (journalFile: string) {
    const journal = yield* fs.readFileString(journalFile).pipe(Effect.flatMap(decodeJournal), Effect.option);
    return O.exists(journal, ({ publication }) => publication._tag === "tracked" && publication.state._tag === halt);
  });
  const afterJournalWrite = Effect.fnUntraced(function* (written: string) {
    if (path.dirname(written) === journals && Str.endsWith(".json")(written) && (yield* reached(written)))
      return yield* pause;
  });
  const halting = FileSystem.FileSystem.of({
    ...fs,
    link: Effect.fn("SkillCrashWriter.link")(function* (source, destination) {
      yield* fs.link(source, destination);
      yield* afterJournalWrite(destination);
    }),
    rename: Effect.fn("SkillCrashWriter.rename")(function* (source, destination) {
      yield* fs.rename(source, destination);
      yield* afterJournalWrite(destination);
    }),
  });
  const base = yield* makeModelsTestExchangeSystem();
  const system: ModelsExchangeSystemShape = {
    ...base,
    exchange: (left, right) =>
      base
        .exchange(left, right)
        .pipe(
          Effect.andThen(
            HaltPoint.is["exchange-returned"](halt) && (left === target || right === target) ? pause : Effect.void
          )
        ),
  };
  const capability = yield* makeModelsAtomicExchange(system);
  const publisher = Context.get(
    yield* Layer.build(
      SkillPublisherLive.pipe(
        Layer.provide(
          Layer.mergeAll(Layer.succeed(FileSystem.FileSystem, halting), Layer.succeed(ModelsAtomicExchange, capability))
        )
      )
    ),
    SkillPublisher
  );
  const encoder = new TextEncoder();
  yield* Mode.$match(mode, {
    "publish-file": () => publisher.publishFile(root, target, intendedFile),
    "publish-directory": () =>
      publisher.publishDirectory(
        root,
        target,
        A.map(intendedTree, (file) => SkillPublicationFile.make({ path: file.path, bytes: encoder.encode(file.text) }))
      ),
    recover: () => publisher.recover(root, "pending").pipe(Effect.asVoid),
  });
  yield* Console.log("DONE");
});

const program = Layer.mergeAll(NodeServices.layer, NodeCrypto.layer).pipe(
  Layer.build,
  Effect.flatMap((context) => main.pipe(Effect.provide(context))),
  Effect.scoped
);
BunRuntime.runMain(program);
