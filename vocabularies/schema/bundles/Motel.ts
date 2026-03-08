import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';
import { MotelMixin } from '../lib/Motel.js';

export const MotelBundle = [
  LodgingBusinessMixin as Mixin,
  MotelMixin as Mixin];
