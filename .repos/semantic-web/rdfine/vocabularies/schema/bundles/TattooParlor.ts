import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';
import { TattooParlorMixin } from '../lib/TattooParlor.js';

export const TattooParlorBundle = [
  HealthAndBeautyBusinessMixin as Mixin,
  TattooParlorMixin as Mixin];
