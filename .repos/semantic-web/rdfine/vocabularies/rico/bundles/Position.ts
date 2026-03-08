import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { GroupMixin } from '../lib/Group.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { LeadershipRelationMixin } from '../lib/LeadershipRelation.js';
import { MembershipRelationMixin } from '../lib/MembershipRelation.js';
import { PersonMixin } from '../lib/Person.js';
import { PositionMixin } from '../lib/Position.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { ThingMixin } from '../lib/Thing.js';

export const PositionBundle = [
  AgentMixin as Mixin,
  GroupMixin as Mixin,
  InstantiationMixin as Mixin,
  LeadershipRelationMixin as Mixin,
  MembershipRelationMixin as Mixin,
  PersonMixin as Mixin,
  PositionMixin as Mixin,
  RecordMixin as Mixin,
  RecordResourceMixin as Mixin,
  ThingMixin as Mixin];
