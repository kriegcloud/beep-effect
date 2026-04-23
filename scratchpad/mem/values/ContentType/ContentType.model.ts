/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";
import * as S from "effect/Schema";
import {Tuple} from "effect";
import {ProceduralSubclass} from "../ProceduralSubclass/index.ts";
import {Model3DSubclass} from "../Model3DSubclass/index.ts";
import {MultimediaSubclass} from "../MultimediaSubclass/index.ts";
import {VideoSubclass} from "../VideoSubclass/index.ts";
import {ImageSubclass} from "../ImageSubclass/index.ts";
import {AudioSubclass} from "../AudioSubclass/index.ts";
import {TextSubclass} from "../TextSubclass/index.ts";

const $I = $ScratchId.create("mem/values/ContentType/ContentType.model")

export const ContentKind = LiteralKit([
  "TEXTUAL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "AUDIO_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "IMAGE_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "VIDEO_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "MULTIMEDIA_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "3D_MODEL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
  "PROCEDURAL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES",
])
  .pipe($I.annoteSchema(
    "ContentKind",
    {
      description: "A list of content kinds used for general purposes",
    },
  ))

export type ContentKind = typeof ContentKind.Type;

export const PredictionLabel = ContentKind.mapMembers(Tuple.evolve([
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(TextSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(AudioSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(ImageSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(VideoSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(MultimediaSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(Model3DSubclass),
  }),
  ({literal}) => S.Struct({
    type: S.tag(literal),
    subclass: S.HashSet(ProceduralSubclass),
  }),
]))
  .pipe(
    $I.annoteSchema("DefaultContent"),
    S.toTaggedUnion("type"),
  )

export type PredictionLabel = typeof PredictionLabel.Type;

export class DefaultContentPrediction extends S.Class<DefaultContentPrediction>($I`DefaultContentPrediction`)(
  {
    label: PredictionLabel,
  },
  $I.annote(
    "DefaultContentPrediction",
    {
      description: "Class for a single class label prediction",
    },
  ),
) {
}

export const TextContent = PredictionLabel.cases.TEXTUAL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type TextContent = typeof TextContent.Type;

export const AudioContent = PredictionLabel.cases.AUDIO_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type AudioContent = typeof AudioContent.Type;

export const ImageContent = PredictionLabel.cases.IMAGE_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type ImageContent = typeof ImageContent.Type;

export const VideoContent = PredictionLabel.cases.VIDEO_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type VideoContent = typeof VideoContent.Type;

export const MultimediaContent = PredictionLabel.cases.MULTIMEDIA_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type MultimediaContent = typeof MultimediaContent.Type;

export const Model3DContent = PredictionLabel.cases["3D_MODEL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES"];

export type Model3DContent = typeof Model3DContent.Type;

export const ProceduralContent = PredictionLabel.cases.PROCEDURAL_DOCUMENTS_USED_FOR_GENERAL_PURPOSES;

export type ProceduralContent = typeof ProceduralContent.Type;
