import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { TravelAgencyMixin } from '../lib/TravelAgency.js';

export const TravelAgencyBundle = [
  LocalBusinessMixin as Mixin,
  TravelAgencyMixin as Mixin];
