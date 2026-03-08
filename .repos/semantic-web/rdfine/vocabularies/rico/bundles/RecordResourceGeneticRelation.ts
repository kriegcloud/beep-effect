import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordResourceGeneticRelationMixin } from '../lib/RecordResourceGeneticRelation.js';
import { RecordResourceToRecordResourceRelationMixin } from '../lib/RecordResourceToRecordResourceRelation.js';

export const RecordResourceGeneticRelationBundle = [
  RecordResourceGeneticRelationMixin as Mixin,
  RecordResourceToRecordResourceRelationMixin as Mixin];
