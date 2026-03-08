import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { MandateMixin } from '../lib/Mandate.js';
import { MandateTypeMixin } from '../lib/MandateType.js';
import { RuleMixin } from '../lib/Rule.js';

export const MandateBundle = [
  AgentMixin as Mixin,
  MandateMixin as Mixin,
  MandateTypeMixin as Mixin,
  RuleMixin as Mixin];
