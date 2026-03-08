import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RuleMixin } from '../lib/Rule.js';
import { SPARQLConstructExecutableMixin } from '../lib/SPARQLConstructExecutable.js';
import { SPARQLRuleMixin } from '../lib/SPARQLRule.js';

export const SPARQLRuleBundle = [
  RuleMixin as Mixin,
  SPARQLConstructExecutableMixin as Mixin,
  SPARQLRuleMixin as Mixin];
