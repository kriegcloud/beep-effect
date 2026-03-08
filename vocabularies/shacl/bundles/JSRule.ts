import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JSExecutableMixin } from '../lib/JSExecutable.js';
import { JSRuleMixin } from '../lib/JSRule.js';
import { RuleMixin } from '../lib/Rule.js';

export const JSRuleBundle = [
  JSExecutableMixin as Mixin,
  JSRuleMixin as Mixin,
  RuleMixin as Mixin];
