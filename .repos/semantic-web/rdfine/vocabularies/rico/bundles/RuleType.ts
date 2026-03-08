import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RuleMixin } from '../lib/Rule.js';
import { RuleTypeMixin } from '../lib/RuleType.js';
import { TypeMixin } from '../lib/Type.js';

export const RuleTypeBundle = [
  RuleMixin as Mixin,
  RuleTypeMixin as Mixin,
  TypeMixin as Mixin];
