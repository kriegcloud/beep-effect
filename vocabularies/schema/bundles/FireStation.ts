import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { EmergencyServiceMixin } from '../lib/EmergencyService.js';
import { FireStationMixin } from '../lib/FireStation.js';

export const FireStationBundle = [
  CivicStructureMixin as Mixin,
  EmergencyServiceMixin as Mixin,
  FireStationMixin as Mixin];
