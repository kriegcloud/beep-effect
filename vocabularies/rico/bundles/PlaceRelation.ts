import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlaceRelationMixin } from '../lib/PlaceRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const PlaceRelationBundle = [
  PlaceRelationMixin as Mixin,
  RelationMixin as Mixin];
