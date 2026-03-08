import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { HVACBusinessMixin } from '../lib/HVACBusiness.js';

export const HVACBusinessBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  HVACBusinessMixin as Mixin];
