/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {SchemaUtils} from "@beep/schema";
import {HashSet} from "effect";
import * as S from "effect/Schema";
import {SummarizedFunction} from "../SummarizedFunction/index.ts";
import {SummarizedClass} from "../SummarizedClass/index.ts";
import {O} from "@beep/utils";

const $I = $ScratchId.create("mem/values/SummarizedCode/SummarizedCode.model")

export class SummarizedCode extends S.Class<SummarizedCode>($I`SummarizedCode`)(
  {
    highLevelSummary: S.String,
    keyFeatures: S.HashSet(S.String),
    imports: S.String.pipe(
      S.HashSet,
      SchemaUtils.withKeyDefaults(HashSet.empty<string>()),
    ),
    constants: S.String.pipe(
      S.HashSet,
      SchemaUtils.withKeyDefaults(HashSet.empty<string>()),
    ),
    classes: SummarizedClass.pipe(
      S.HashSet,
      SchemaUtils.withKeyDefaults(HashSet.empty<SummarizedClass>()),
    ),
    functions: SummarizedFunction.pipe(
      S.HashSet,
      SchemaUtils.withKeyDefaults(HashSet.empty<SummarizedFunction>()),
    ),
    workflowDescription: S.String.pipe(
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<string>()),
    ),
  },
  $I.annote(
    "SummarizedCode",
    {
      description: "",
    },
  ),
) {
}
