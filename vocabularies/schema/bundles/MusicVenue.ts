import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { MusicVenueMixin } from '../lib/MusicVenue.js';

export const MusicVenueBundle = [
  CivicStructureMixin as Mixin,
  MusicVenueMixin as Mixin];
