import * as S from "effect/Schema";
import { $ScratchId } from "@beep/identity";

const $I = $ScratchId.create("BalanceDiffEntry");


export class BalanceDiffEntry extends S.Class<BalanceDiffEntry>($I`BalanceDiffEntry`)(
  {
    calculated: S.Number,
    reported: S.Number,
    diff: S.Number
  },
  $I.annote("BalanceDiffEntry", {
    description: "A balance difference entry with calculated, reported, and computed diff values.",
  })
) {}


