import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { TelevisionStationMixin } from '../lib/TelevisionStation.js';

export const TelevisionStationBundle = [
  LocalBusinessMixin as Mixin,
  TelevisionStationMixin as Mixin];
