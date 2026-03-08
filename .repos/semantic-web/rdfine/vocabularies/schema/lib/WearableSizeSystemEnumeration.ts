import { schema } from './namespace.js';

const values = {
  WearableSizeSystemAU: schema.WearableSizeSystemAU,
  WearableSizeSystemBR: schema.WearableSizeSystemBR,
  WearableSizeSystemCN: schema.WearableSizeSystemCN,
  WearableSizeSystemContinental: schema.WearableSizeSystemContinental,
  WearableSizeSystemDE: schema.WearableSizeSystemDE,
  WearableSizeSystemEN13402: schema.WearableSizeSystemEN13402,
  WearableSizeSystemEurope: schema.WearableSizeSystemEurope,
  WearableSizeSystemFR: schema.WearableSizeSystemFR,
  WearableSizeSystemGS1: schema.WearableSizeSystemGS1,
  WearableSizeSystemIT: schema.WearableSizeSystemIT,
  WearableSizeSystemJP: schema.WearableSizeSystemJP,
  WearableSizeSystemMX: schema.WearableSizeSystemMX,
  WearableSizeSystemUK: schema.WearableSizeSystemUK,
  WearableSizeSystemUS: schema.WearableSizeSystemUS,
};

export type WearableSizeSystemEnumeration = typeof values[keyof typeof values];

export default values;
