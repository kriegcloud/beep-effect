import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  Effect,
  FileSystem,
  Path,
  ServiceMap,
  Layer,
  Exit,
  RequestResolver,
  SchemaTransformation,
  type Cause,
} from "effect";
import {Struct, P, A, O} from "@beep/utils";
import {
  SqlClient,
  SqlError,
  SqlModel,
  SqlSchema,
  SqlResolver,
} from "effect/unstable/sql";
import {$ScratchId} from "@beep/identity";
import {BunRuntime, BunServices} from "@effect/platform-bun";
import {
  Model
} from "effect/unstable/schema";
import {
  EmbeddingModel,
} from "effect/unstable/ai";

const $I = $ScratchId.create("index");


interface ServiceShape {

}

const program = Effect.gen(function* () {

});

BunRuntime.runMain(
  Effect.scoped(
    Layer.build(BunServices.layer)
      .pipe(
        Effect.flatMap((context) => program.pipe(Effect.provide(context)))
      )
  ),
  {
    teardown: (
      exit,
      onExit
    ) => {
      if (Exit.isSuccess(exit)) {
        console.log(
          "Program completed successfully with value:",
          exit.value
        )
        onExit(0)
      } else {
        console.log(
          "Program failed with cause:",
          exit.cause
        )
        onExit(1)
      }
    }
  }
)
