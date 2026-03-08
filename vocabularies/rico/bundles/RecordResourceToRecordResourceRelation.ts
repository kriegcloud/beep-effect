import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordResourceToRecordResourceRelationMixin } from '../lib/RecordResourceToRecordResourceRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const RecordResourceToRecordResourceRelationBundle = [
  RecordResourceToRecordResourceRelationMixin as Mixin,
  RelationMixin as Mixin];
