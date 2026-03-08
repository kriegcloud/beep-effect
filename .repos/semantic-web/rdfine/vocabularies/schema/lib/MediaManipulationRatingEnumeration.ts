import { schema } from './namespace.js';

const values = {
  DecontextualizedContent: schema.DecontextualizedContent,
  EditedOrCroppedContent: schema.EditedOrCroppedContent,
  OriginalMediaContent: schema.OriginalMediaContent,
  SatireOrParodyContent: schema.SatireOrParodyContent,
  StagedContent: schema.StagedContent,
  TransformedContent: schema.TransformedContent,
};

export type MediaManipulationRatingEnumeration = typeof values[keyof typeof values];

export default values;
