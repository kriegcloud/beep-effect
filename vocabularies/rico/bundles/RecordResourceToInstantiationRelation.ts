import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordResourceToInstantiationRelationMixin } from '../lib/RecordResourceToInstantiationRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const RecordResourceToInstantiationRelationBundle = [
  RecordResourceToInstantiationRelationMixin as Mixin,
  RelationMixin as Mixin];
