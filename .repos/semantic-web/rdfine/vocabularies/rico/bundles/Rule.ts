import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RuleMixin } from '../lib/Rule.js';
import { RuleTypeMixin } from '../lib/RuleType.js';
import { ThingMixin } from '../lib/Thing.js';
import { TitleMixin } from '../lib/Title.js';

export const RuleBundle = [
  AgentMixin as Mixin,
  RecordResourceMixin as Mixin,
  RuleMixin as Mixin,
  RuleTypeMixin as Mixin,
  ThingMixin as Mixin,
  TitleMixin as Mixin];
