import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { GasStationMixin } from '../lib/GasStation.js';

export const GasStationBundle = [
  AutomotiveBusinessMixin as Mixin,
  GasStationMixin as Mixin];
