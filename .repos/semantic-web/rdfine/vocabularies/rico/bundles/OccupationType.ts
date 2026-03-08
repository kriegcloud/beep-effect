import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityTypeMixin } from '../lib/ActivityType.js';
import { DemographicGroupMixin } from '../lib/DemographicGroup.js';
import { OccupationTypeMixin } from '../lib/OccupationType.js';
import { PersonMixin } from '../lib/Person.js';

export const OccupationTypeBundle = [
  ActivityTypeMixin as Mixin,
  DemographicGroupMixin as Mixin,
  OccupationTypeMixin as Mixin,
  PersonMixin as Mixin];
