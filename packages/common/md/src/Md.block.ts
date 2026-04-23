/**
 * @module @beep/md/Md.block
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import * as Utils from "./Md.utils.ts";

const $I = $MdId.create("Md.block");

export class HeadingOptions extends S.Class<HeadingOptions>($I`HeadingOptions`)(
  {
    level: PosInt,
  },
  $I.annote("HeadingOptions", {
    description: "",
  })
) {}
