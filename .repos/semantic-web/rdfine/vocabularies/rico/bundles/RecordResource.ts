import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { DateMixin } from '../lib/Date.js';
import { GroupMixin } from '../lib/Group.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { PersonMixin } from '../lib/Person.js';
import { PositionMixin } from '../lib/Position.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RelationMixin } from '../lib/Relation.js';
import { RuleMixin } from '../lib/Rule.js';
import { ThingMixin } from '../lib/Thing.js';
import { TitleMixin } from '../lib/Title.js';

export const RecordResourceBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  DateMixin as Mixin,
  GroupMixin as Mixin,
  InstantiationMixin as Mixin,
  PersonMixin as Mixin,
  PositionMixin as Mixin,
  RecordResourceMixin as Mixin,
  RelationMixin as Mixin,
  RuleMixin as Mixin,
  ThingMixin as Mixin,
  TitleMixin as Mixin];
