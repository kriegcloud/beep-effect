import { schema } from './namespace.js';

const values = {
  AlcoholConsideration: schema.AlcoholConsideration,
  DangerousGoodConsideration: schema.DangerousGoodConsideration,
  HealthcareConsideration: schema.HealthcareConsideration,
  NarcoticConsideration: schema.NarcoticConsideration,
  ReducedRelevanceForChildrenConsideration: schema.ReducedRelevanceForChildrenConsideration,
  SexualContentConsideration: schema.SexualContentConsideration,
  TobaccoNicotineConsideration: schema.TobaccoNicotineConsideration,
  UnclassifiedAdultConsideration: schema.UnclassifiedAdultConsideration,
  ViolenceConsideration: schema.ViolenceConsideration,
  WeaponConsideration: schema.WeaponConsideration,
};

export type AdultOrientedEnumeration = typeof values[keyof typeof values];

export default values;
