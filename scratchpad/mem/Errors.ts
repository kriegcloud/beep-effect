import {$ScratchId} from "@beep/identity";
import {CauseTaggedError, SchemaUtils} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/Errors");

export class IngestionError extends CauseTaggedError<IngestionError>($I`IngestionError`)(
  "IngestionError",
  {},
  $I.annote(
    "IngestionError",
    {
      description: "Error during ingestion process",
      status: 422,
    },
  ),
) {

}

export class UsageLoggerError extends CauseTaggedError<UsageLoggerError>($I`UseageLoggerError`)(
  "UseageLoggerError",
  {},
  $I.annote(
    "UseageLoggerError",
    {
      description: "Error during usage logging process",
      status: 500,
    },
  ),
) {
}
