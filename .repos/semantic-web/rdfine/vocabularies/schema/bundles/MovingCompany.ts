import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { MovingCompanyMixin } from '../lib/MovingCompany.js';

export const MovingCompanyBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  MovingCompanyMixin as Mixin];
