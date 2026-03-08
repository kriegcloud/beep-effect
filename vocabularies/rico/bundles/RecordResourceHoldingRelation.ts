import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ManagementRelationMixin } from '../lib/ManagementRelation.js';
import { RecordResourceHoldingRelationMixin } from '../lib/RecordResourceHoldingRelation.js';

export const RecordResourceHoldingRelationBundle = [
  ManagementRelationMixin as Mixin,
  RecordResourceHoldingRelationMixin as Mixin];
