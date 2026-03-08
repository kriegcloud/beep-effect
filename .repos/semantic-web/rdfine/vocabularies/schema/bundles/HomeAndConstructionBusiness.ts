import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const HomeAndConstructionBusinessBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  LocalBusinessMixin as Mixin];
