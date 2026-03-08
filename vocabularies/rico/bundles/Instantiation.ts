import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { CarrierTypeMixin } from '../lib/CarrierType.js';
import { DateMixin } from '../lib/Date.js';
import { GroupMixin } from '../lib/Group.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { PersonMixin } from '../lib/Person.js';
import { PositionMixin } from '../lib/Position.js';
import { ProductionTechniqueTypeMixin } from '../lib/ProductionTechniqueType.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RepresentationTypeMixin } from '../lib/RepresentationType.js';
import { ThingMixin } from '../lib/Thing.js';
import { TitleMixin } from '../lib/Title.js';

export const InstantiationBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  CarrierTypeMixin as Mixin,
  DateMixin as Mixin,
  GroupMixin as Mixin,
  InstantiationMixin as Mixin,
  PersonMixin as Mixin,
  PositionMixin as Mixin,
  ProductionTechniqueTypeMixin as Mixin,
  RecordResourceMixin as Mixin,
  RepresentationTypeMixin as Mixin,
  ThingMixin as Mixin,
  TitleMixin as Mixin];
