import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { RadioStationMixin } from '../lib/RadioStation.js';

export const RadioStationBundle = [
  LocalBusinessMixin as Mixin,
  RadioStationMixin as Mixin];
