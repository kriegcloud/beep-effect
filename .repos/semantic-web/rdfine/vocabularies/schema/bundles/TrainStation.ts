import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { TrainStationMixin } from '../lib/TrainStation.js';

export const TrainStationBundle = [
  CivicStructureMixin as Mixin,
  TrainStationMixin as Mixin];
