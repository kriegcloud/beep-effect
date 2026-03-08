import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ParentAudienceMixin } from '../lib/ParentAudience.js';
import { PeopleAudienceMixin } from '../lib/PeopleAudience.js';

export const ParentAudienceBundle = [
  ParentAudienceMixin as Mixin,
  PeopleAudienceMixin as Mixin];
