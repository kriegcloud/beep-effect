import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BedAndBreakfastMixin } from '../lib/BedAndBreakfast.js';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';

export const BedAndBreakfastBundle = [
  BedAndBreakfastMixin as Mixin,
  LodgingBusinessMixin as Mixin];
