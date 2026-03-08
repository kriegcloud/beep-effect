import { schema } from './namespace.js';

const values = {
  WearableSizeGroupBig: schema.WearableSizeGroupBig,
  WearableSizeGroupBoys: schema.WearableSizeGroupBoys,
  WearableSizeGroupExtraShort: schema.WearableSizeGroupExtraShort,
  WearableSizeGroupExtraTall: schema.WearableSizeGroupExtraTall,
  WearableSizeGroupGirls: schema.WearableSizeGroupGirls,
  WearableSizeGroupHusky: schema.WearableSizeGroupHusky,
  WearableSizeGroupInfants: schema.WearableSizeGroupInfants,
  WearableSizeGroupJuniors: schema.WearableSizeGroupJuniors,
  WearableSizeGroupMaternity: schema.WearableSizeGroupMaternity,
  WearableSizeGroupMens: schema.WearableSizeGroupMens,
  WearableSizeGroupMisses: schema.WearableSizeGroupMisses,
  WearableSizeGroupPetite: schema.WearableSizeGroupPetite,
  WearableSizeGroupPlus: schema.WearableSizeGroupPlus,
  WearableSizeGroupRegular: schema.WearableSizeGroupRegular,
  WearableSizeGroupShort: schema.WearableSizeGroupShort,
  WearableSizeGroupTall: schema.WearableSizeGroupTall,
  WearableSizeGroupWomens: schema.WearableSizeGroupWomens,
};

export type WearableSizeGroupEnumeration = typeof values[keyof typeof values];

export default values;
