import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const SportsActivityLocationBundle = [
  LocalBusinessMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
