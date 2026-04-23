/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {LiteralKit, MappedLiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/ProceduralSubclass/ProceduralSubclass.model")

export const ProceduralSubclass = MappedLiteralKit([
  [
    "TUTORIALS_GUIDES",
    "Tutorials and step-by-step guides",
  ],
  [
    "WORKFLOW_DESCRIPTIONS",
    "Workflow and process descriptions",
  ],
  [
    "SIMULATIONS",
    "Simulation and training exercises",
  ],
  [
    "RECIPES",
    "Recipes and crafting instructions",
  ],
  [
    "OTHER_PROCEDURAL",
    "Other types of procedural content",
  ],
]).pipe(
  $I.annoteSchema("ProceduralSubclasss")
)

export type ProceduralSubclass = typeof ProceduralSubclass.Type;
