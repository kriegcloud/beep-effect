import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EnergyMixin } from '../lib/Energy.js';
import { MassMixin } from '../lib/Mass.js';
import { NutritionInformationMixin } from '../lib/NutritionInformation.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const NutritionInformationBundle = [
  EnergyMixin as Mixin,
  MassMixin as Mixin,
  NutritionInformationMixin as Mixin,
  StructuredValueMixin as Mixin];
