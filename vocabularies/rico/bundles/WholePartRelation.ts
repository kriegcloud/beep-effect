import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RelationMixin } from '../lib/Relation.js';
import { WholePartRelationMixin } from '../lib/WholePartRelation.js';

export const WholePartRelationBundle = [
  RelationMixin as Mixin,
  WholePartRelationMixin as Mixin];
