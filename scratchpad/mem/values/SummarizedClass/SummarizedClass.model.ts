/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {SummarizedFunction} from "../SummarizedFunction/index.ts";
import type {HashSet} from "effect";
import {O} from "@beep/utils";
import * as S from "effect/Schema";
import {SchemaUtils} from "@beep/schema";

const $I = $ScratchId.create("mem/values/SummarizedClass/SummarizedClass.model")

export class SummarizedClass extends S.Class<SummarizedClass>($I`SummarizedClass`)(
  {
    name: S.String,
    description: S.String,
    methods: SummarizedFunction.pipe(
      S.HashSet,
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<HashSet.HashSet<SummarizedFunction>>()),
    ),
    decorators: S.String.pipe(
      S.HashSet,
      S.Option,
      SchemaUtils.withKeyDefaults(O.none<HashSet.HashSet<string>>()),
    ),
  },
  $I.annote(
    "SummarizedClass",
    {
      description: "A class that summarizes information about a class",
    },
  ),
) {
}
