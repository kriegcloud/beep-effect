/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";


const $I = $ScratchId.create("mem/values/ImageSubclass/ImageSubclass.model")

export const ImageSubclass = MappedLiteralKit([
  [
    "PHOTOGRAPHS",
    "Photographs and digital images",
  ],
  [
    "ILLUSTRATIONS",
    "Illustrations, diagrams, and charts",
  ],
  [
    "INFOGRAPHICS",
    "Infographics and visual data representations",
  ],
  [
    "ARTWORK",
    "Artwork and paintings",
  ],
  [
    "SCREENSHOTS",
    "Screenshots and graphical user interfaces",
  ],
  [
    "OTHER_IMAGES",
    "Other types of images",
  ],
])
  .pipe($I.annoteSchema(
    "ImageSubclass",
    {
      description: "A subclass of image",
    },
  ))

export type ImageSubclass = typeof ImageSubclass.Type;
