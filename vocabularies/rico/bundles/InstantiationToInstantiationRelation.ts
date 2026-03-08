import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InstantiationToInstantiationRelationMixin } from '../lib/InstantiationToInstantiationRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const InstantiationToInstantiationRelationBundle = [
  InstantiationToInstantiationRelationMixin as Mixin,
  RelationMixin as Mixin];
