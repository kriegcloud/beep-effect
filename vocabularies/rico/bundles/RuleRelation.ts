import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RelationMixin } from '../lib/Relation.js';
import { RuleRelationMixin } from '../lib/RuleRelation.js';

export const RuleRelationBundle = [
  RelationMixin as Mixin,
  RuleRelationMixin as Mixin];
