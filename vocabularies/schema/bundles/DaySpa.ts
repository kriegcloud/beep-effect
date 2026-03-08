import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DaySpaMixin } from '../lib/DaySpa.js';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';

export const DaySpaBundle = [
  DaySpaMixin as Mixin,
  HealthAndBeautyBusinessMixin as Mixin];
