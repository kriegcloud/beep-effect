import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RuleMixin } from '../lib/Rule.js';
import { ShapeMixin } from '../lib/Shape.js';

export const RuleBundle = [
  RuleMixin as Mixin,
  ShapeMixin as Mixin];
