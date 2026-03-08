import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdultEntertainmentMixin } from '../lib/AdultEntertainment.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';

export const AdultEntertainmentBundle = [
  AdultEntertainmentMixin as Mixin,
  EntertainmentBusinessMixin as Mixin];
