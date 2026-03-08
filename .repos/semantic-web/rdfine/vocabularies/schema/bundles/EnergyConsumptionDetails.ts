import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EnergyConsumptionDetailsMixin } from '../lib/EnergyConsumptionDetails.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const EnergyConsumptionDetailsBundle = [
  EnergyConsumptionDetailsMixin as Mixin,
  IntangibleMixin as Mixin];
