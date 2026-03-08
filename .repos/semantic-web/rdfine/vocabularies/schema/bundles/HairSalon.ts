import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HairSalonMixin } from '../lib/HairSalon.js';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';

export const HairSalonBundle = [
  HairSalonMixin as Mixin,
  HealthAndBeautyBusinessMixin as Mixin];
