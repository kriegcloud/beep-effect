import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { TaxiStandMixin } from '../lib/TaxiStand.js';

export const TaxiStandBundle = [
  CivicStructureMixin as Mixin,
  TaxiStandMixin as Mixin];
