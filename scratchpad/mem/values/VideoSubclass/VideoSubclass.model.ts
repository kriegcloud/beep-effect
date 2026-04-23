/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";

const $I = $ScratchId.create("mem/values/VideoSubclass/VideoSubclass.model")

export const VideoSubclass = MappedLiteralKit([
  [
    "MOVIES",
    "Movies and short films",
  ],
  [
    "DOCUMENTARIES",
    "Documentaries and educational videos",
  ],
  [
    "TUTORIALS",
    "Video tutorials and how-to guides",
  ],
  [
    "ANIMATED_FEATURES",
    "Animated features and cartoons",
  ],
  [
    "LIVE_EVENTS",
    "Live event recordings and sports broadcasts",
  ],
  [
    "OTHER_VIDEOS",
    "Other types of video content",
  ],
])
  .pipe($I.annoteSchema(
    "VideoSubclass",
    {
      description: "A video subclass in the knowledge graph",
    },
  ))

export type VideoSubclass = typeof VideoSubclass.Type;
