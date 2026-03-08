import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CampgroundMixin } from '../lib/Campground.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';

export const CampgroundBundle = [
  CampgroundMixin as Mixin,
  CivicStructureMixin as Mixin,
  LodgingBusinessMixin as Mixin];
