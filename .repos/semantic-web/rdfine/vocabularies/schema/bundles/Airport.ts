import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AirportMixin } from '../lib/Airport.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const AirportBundle = [
  AirportMixin as Mixin,
  CivicStructureMixin as Mixin];
