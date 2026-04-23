/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {LiteralKit, MappedLiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/Model3DSubclass/Model3DSubclass.model")

export const Model3DSubclass = MappedLiteralKit([
  [
    "ARCHITECTURAL_RENDERINGS",
    "Architectural renderings and building plans",
  ],
  [
    "PRODUCT_MODELS",
    "Product design models and prototypes",
  ],
  [
    "ANIMATIONS",
    "3D animations and character models",
  ],
  [
    "SCIENTIFIC_VISUALIZATIONS",
    "Scientific simulations and visualizations",
  ],
  [
    "VR_OBJECTS",
    "Virtual objects for AR/VR applications",
  ],
  [
    "OTHER_3D_MODELS",
    "Other types of 3D models",
  ],
])
  .pipe($I.annoteSchema(
    "Model3DSubclass",
    {
      description: "A categorization of 3D models based on their primary use or content type.",
    },
  ))

export type Model3DSubclass = typeof Model3DSubclass.Type;
