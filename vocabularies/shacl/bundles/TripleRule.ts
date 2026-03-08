import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RuleMixin } from '../lib/Rule.js';
import { TripleRuleMixin } from '../lib/TripleRule.js';

export const TripleRuleBundle = [
  RuleMixin as Mixin,
  TripleRuleMixin as Mixin];
