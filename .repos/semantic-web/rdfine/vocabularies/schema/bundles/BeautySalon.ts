import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BeautySalonMixin } from '../lib/BeautySalon.js';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';

export const BeautySalonBundle = [
  BeautySalonMixin as Mixin,
  HealthAndBeautyBusinessMixin as Mixin];
