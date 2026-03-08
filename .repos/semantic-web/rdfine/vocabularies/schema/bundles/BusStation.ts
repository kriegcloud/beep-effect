import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusStationMixin } from '../lib/BusStation.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const BusStationBundle = [
  BusStationMixin as Mixin,
  CivicStructureMixin as Mixin];
