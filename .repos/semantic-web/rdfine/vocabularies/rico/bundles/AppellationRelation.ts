import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AppellationRelationMixin } from '../lib/AppellationRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const AppellationRelationBundle = [
  AppellationRelationMixin as Mixin,
  RelationMixin as Mixin];
