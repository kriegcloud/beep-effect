import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CableOrSatelliteServiceMixin } from '../lib/CableOrSatelliteService.js';
import { ServiceMixin } from '../lib/Service.js';

export const CableOrSatelliteServiceBundle = [
  CableOrSatelliteServiceMixin as Mixin,
  ServiceMixin as Mixin];
