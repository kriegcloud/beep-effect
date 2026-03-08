import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { PlumberMixin } from '../lib/Plumber.js';

export const PlumberBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  PlumberMixin as Mixin];
