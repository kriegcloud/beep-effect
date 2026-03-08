import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RelationMixin } from '../lib/Relation.js';
import { SequentialRelationMixin } from '../lib/SequentialRelation.js';

export const SequentialRelationBundle = [
  RelationMixin as Mixin,
  SequentialRelationMixin as Mixin];
