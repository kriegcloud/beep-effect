import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FloorPlanMixin } from '../lib/FloorPlan.js';
import { PlaceMixin } from '../lib/Place.js';
import { ResidenceMixin } from '../lib/Residence.js';

export const ResidenceBundle = [
  FloorPlanMixin as Mixin,
  PlaceMixin as Mixin,
  ResidenceMixin as Mixin];
