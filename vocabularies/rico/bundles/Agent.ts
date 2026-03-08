import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { AgentNameMixin } from '../lib/AgentName.js';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { LanguageMixin } from '../lib/Language.js';
import { LegalStatusMixin } from '../lib/LegalStatus.js';
import { MandateMixin } from '../lib/Mandate.js';
import { MandateRelationMixin } from '../lib/MandateRelation.js';
import { PlaceMixin } from '../lib/Place.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RuleMixin } from '../lib/Rule.js';
import { ThingMixin } from '../lib/Thing.js';

export const AgentBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  AgentNameMixin as Mixin,
  InstantiationMixin as Mixin,
  LanguageMixin as Mixin,
  LegalStatusMixin as Mixin,
  MandateMixin as Mixin,
  MandateRelationMixin as Mixin,
  PlaceMixin as Mixin,
  RecordResourceMixin as Mixin,
  RuleMixin as Mixin,
  ThingMixin as Mixin];
