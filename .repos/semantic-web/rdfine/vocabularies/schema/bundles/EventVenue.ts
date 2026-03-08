import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { EventVenueMixin } from '../lib/EventVenue.js';

export const EventVenueBundle = [
  CivicStructureMixin as Mixin,
  EventVenueMixin as Mixin];
