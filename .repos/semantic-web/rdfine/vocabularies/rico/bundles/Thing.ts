import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { AppellationMixin } from '../lib/Appellation.js';
import { DateMixin } from '../lib/Date.js';
import { EventMixin } from '../lib/Event.js';
import { ExtentMixin } from '../lib/Extent.js';
import { GroupMixin } from '../lib/Group.js';
import { IdentifierMixin } from '../lib/Identifier.js';
import { NameMixin } from '../lib/Name.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PositionMixin } from '../lib/Position.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RelationMixin } from '../lib/Relation.js';
import { RuleMixin } from '../lib/Rule.js';
import { ThingMixin } from '../lib/Thing.js';
import { TypeMixin } from '../lib/Type.js';

export const ThingBundle = [
  AgentMixin as Mixin,
  AppellationMixin as Mixin,
  DateMixin as Mixin,
  EventMixin as Mixin,
  ExtentMixin as Mixin,
  GroupMixin as Mixin,
  IdentifierMixin as Mixin,
  NameMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PositionMixin as Mixin,
  RecordResourceMixin as Mixin,
  RelationMixin as Mixin,
  RuleMixin as Mixin,
  ThingMixin as Mixin,
  TypeMixin as Mixin];
