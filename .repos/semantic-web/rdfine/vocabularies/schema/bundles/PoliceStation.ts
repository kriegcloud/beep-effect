import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { EmergencyServiceMixin } from '../lib/EmergencyService.js';
import { PoliceStationMixin } from '../lib/PoliceStation.js';

export const PoliceStationBundle = [
  CivicStructureMixin as Mixin,
  EmergencyServiceMixin as Mixin,
  PoliceStationMixin as Mixin];
