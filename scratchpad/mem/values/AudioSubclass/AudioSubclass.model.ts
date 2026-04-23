/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/AudioSubclass/AudioSubclass.model")

export const AudioSubclass = MappedLiteralKit([
  [
    "MUSIC_TRACKS",
    "Music tracks and albums",
  ],
  [
    "PODCASTS",
    "Podcasts and radio broadcasts",
  ],
  [
    "AUDIOBOOKS",
    "Audiobooks and audio guides",
  ],
  [
    "INTERVIEWS",
    "Recorded interviews and speeches",
  ],
  [
    "SOUND_EFFECTS",
    "Sound effects and ambient sounds",
  ],
  [
    "OTHER_AUDIO",
    "Other types of audio recordings",
  ],
])
  .pipe($I.annoteSchema(
    "AudioSubclass",
    {
      description: "Enumeration of different types of audio content, including music tracks, podcasts, audiobooks, interviews, sound effects, and other audio recordings.",
    },
  ))

export type AudioSubclass = typeof AudioSubclass.Type;
