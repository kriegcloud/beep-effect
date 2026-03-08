import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { ParkingFacilityMixin } from '../lib/ParkingFacility.js';

export const ParkingFacilityBundle = [
  CivicStructureMixin as Mixin,
  ParkingFacilityMixin as Mixin];
