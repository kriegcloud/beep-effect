import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';
import { NailSalonMixin } from '../lib/NailSalon.js';

export const NailSalonBundle = [
  HealthAndBeautyBusinessMixin as Mixin,
  NailSalonMixin as Mixin];
