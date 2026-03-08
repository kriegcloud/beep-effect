import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusStopMixin } from '../lib/BusStop.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const BusStopBundle = [
  BusStopMixin as Mixin,
  CivicStructureMixin as Mixin];
