import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const EntertainmentBusinessBundle = [
  EntertainmentBusinessMixin as Mixin,
  LocalBusinessMixin as Mixin];
