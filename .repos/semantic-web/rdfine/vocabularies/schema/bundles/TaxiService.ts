import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ServiceMixin } from '../lib/Service.js';
import { TaxiServiceMixin } from '../lib/TaxiService.js';

export const TaxiServiceBundle = [
  ServiceMixin as Mixin,
  TaxiServiceMixin as Mixin];
