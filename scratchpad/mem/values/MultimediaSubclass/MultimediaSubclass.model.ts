/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {LiteralKit, MappedLiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/MultimediaSubclass/MultimediaSubclass.model")

export const MultimediaSubclass = MappedLiteralKit([
  [
    "WEB_CONTENT",
    "Interactive web content and games",
  ],
  [
    "VR_EXPERIENCES",
    "Virtual reality (VR) and augmented reality (AR) experiences",
  ],
  [
    "MIXED_MEDIA",
    "Mixed media presentations and slide decks",
  ],
  [
    "E_LEARNING_MODULES",
    "E-learning modules with integrated multimedia",
  ],
  [
    "DIGITAL_EXHIBITIONS",
    "Digital exhibitions and virtual tours",
  ],
  [
    "OTHER_MULTIMEDIA",
    "Other types of multimedia content",
  ],
])
  .pipe($I.annoteSchema(
    "MultimediaSubclass",
    {
      description: "A categorization of multimedia content based on its primary use or content type.",
    },
  ))
export type MultimediaSubclass = typeof MultimediaSubclass.Type;
