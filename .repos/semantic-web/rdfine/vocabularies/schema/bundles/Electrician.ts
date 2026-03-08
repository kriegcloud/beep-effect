import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ElectricianMixin } from '../lib/Electrician.js';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';

export const ElectricianBundle = [
  ElectricianMixin as Mixin,
  HomeAndConstructionBusinessMixin as Mixin];
