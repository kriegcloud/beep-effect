import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { DemographicGroupMixin } from '../lib/DemographicGroup.js';
import { GroupMixin } from '../lib/Group.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { PersonMixin } from '../lib/Person.js';
import { PositionMixin } from '../lib/Position.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { ThingMixin } from '../lib/Thing.js';

export const GroupBundle = [
  AgentMixin as Mixin,
  DemographicGroupMixin as Mixin,
  GroupMixin as Mixin,
  InstantiationMixin as Mixin,
  PersonMixin as Mixin,
  PositionMixin as Mixin,
  RecordMixin as Mixin,
  RecordResourceMixin as Mixin,
  ThingMixin as Mixin];
