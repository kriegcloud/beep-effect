import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DemographicGroupMixin } from '../lib/DemographicGroup.js';
import { GroupMixin } from '../lib/Group.js';
import { PersonMixin } from '../lib/Person.js';
import { TypeMixin } from '../lib/Type.js';

export const DemographicGroupBundle = [
  DemographicGroupMixin as Mixin,
  GroupMixin as Mixin,
  PersonMixin as Mixin,
  TypeMixin as Mixin];
