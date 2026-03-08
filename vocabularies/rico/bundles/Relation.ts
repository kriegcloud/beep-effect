import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RelationMixin } from '../lib/Relation.js';
import { ThingMixin } from '../lib/Thing.js';

export const RelationBundle = [
  RecordResourceMixin as Mixin,
  RelationMixin as Mixin,
  ThingMixin as Mixin];
