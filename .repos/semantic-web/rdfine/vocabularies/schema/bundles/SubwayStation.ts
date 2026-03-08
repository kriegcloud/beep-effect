import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { SubwayStationMixin } from '../lib/SubwayStation.js';

export const SubwayStationBundle = [
  CivicStructureMixin as Mixin,
  SubwayStationMixin as Mixin];
