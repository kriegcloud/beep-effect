import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';
import { ResortMixin } from '../lib/Resort.js';

export const ResortBundle = [
  LodgingBusinessMixin as Mixin,
  ResortMixin as Mixin];
