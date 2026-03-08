import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RelationMixin } from '../lib/Relation.js';
import { TypeRelationMixin } from '../lib/TypeRelation.js';

export const TypeRelationBundle = [
  RelationMixin as Mixin,
  TypeRelationMixin as Mixin];
