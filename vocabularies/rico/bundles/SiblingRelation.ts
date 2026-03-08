import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FamilyRelationMixin } from '../lib/FamilyRelation.js';
import { SiblingRelationMixin } from '../lib/SiblingRelation.js';

export const SiblingRelationBundle = [
  FamilyRelationMixin as Mixin,
  SiblingRelationMixin as Mixin];
