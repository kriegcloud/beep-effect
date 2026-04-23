/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {SchemaUtils} from "@beep/schema";
import * as S from "effect/Schema";
import {O} from "@beep/utils";
import type {HashSet} from "effect";

const $I = $ScratchId.create("mem/values/SummarizedFunction/SummarizedFunction.model")

export class SummarizedFunction extends S.Class<SummarizedFunction>($I`SummarizedFunction`)(
  {
    name: S.String,
    description: S.String,
    inputs: S.String.pipe(
      S.HashSet,
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<HashSet.HashSet<string>>()),
    ),
    outputs: S.String.pipe(
      S.HashSet,
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<HashSet.HashSet<string>>()),
    ),
    decorators: S.String.pipe(
      S.HashSet,
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<HashSet.HashSet<string>>()),
    ),
  },
  $I.annote(
    "SummarizedFunction",
    {
      description: "A class that summarizes information about a function",
    },
  ),
) {
}
