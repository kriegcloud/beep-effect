import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { CorporateBodyMixin } from '../lib/CorporateBody.js';
import { DateMixin } from '../lib/Date.js';
import { DemographicGroupMixin } from '../lib/DemographicGroup.js';
import { GroupMixin } from '../lib/Group.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { OccupationTypeMixin } from '../lib/OccupationType.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PositionMixin } from '../lib/Position.js';
import { RecordMixin } from '../lib/Record.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { ThingMixin } from '../lib/Thing.js';

export const PersonBundle = [
  AgentMixin as Mixin,
  CorporateBodyMixin as Mixin,
  DateMixin as Mixin,
  DemographicGroupMixin as Mixin,
  GroupMixin as Mixin,
  InstantiationMixin as Mixin,
  OccupationTypeMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PositionMixin as Mixin,
  RecordMixin as Mixin,
  RecordResourceMixin as Mixin,
  ThingMixin as Mixin];
