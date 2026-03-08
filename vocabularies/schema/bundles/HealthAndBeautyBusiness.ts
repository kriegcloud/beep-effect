import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const HealthAndBeautyBusinessBundle = [
  HealthAndBeautyBusinessMixin as Mixin,
  LocalBusinessMixin as Mixin];
