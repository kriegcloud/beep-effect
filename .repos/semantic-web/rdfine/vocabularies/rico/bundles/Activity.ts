import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ActivityTypeMixin } from '../lib/ActivityType.js';
import { AgentMixin } from '../lib/Agent.js';
import { AgentTemporalRelationMixin } from '../lib/AgentTemporalRelation.js';
import { EventMixin } from '../lib/Event.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { MandateRelationMixin } from '../lib/MandateRelation.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';

export const ActivityBundle = [
  ActivityMixin as Mixin,
  ActivityTypeMixin as Mixin,
  AgentMixin as Mixin,
  AgentTemporalRelationMixin as Mixin,
  EventMixin as Mixin,
  InstantiationMixin as Mixin,
  MandateRelationMixin as Mixin,
  RecordResourceMixin as Mixin];
