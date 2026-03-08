import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ServiceMixin } from '../lib/Service.js';
import { TaxiMixin } from '../lib/Taxi.js';

export const TaxiBundle = [
  ServiceMixin as Mixin,
  TaxiMixin as Mixin];
