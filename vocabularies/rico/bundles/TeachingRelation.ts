import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { KnowingRelationMixin } from '../lib/KnowingRelation.js';
import { TeachingRelationMixin } from '../lib/TeachingRelation.js';

export const TeachingRelationBundle = [
  KnowingRelationMixin as Mixin,
  TeachingRelationMixin as Mixin];
