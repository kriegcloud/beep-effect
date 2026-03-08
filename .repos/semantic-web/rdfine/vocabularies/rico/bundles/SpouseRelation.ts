import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FamilyRelationMixin } from '../lib/FamilyRelation.js';
import { SpouseRelationMixin } from '../lib/SpouseRelation.js';

export const SpouseRelationBundle = [
  FamilyRelationMixin as Mixin,
  SpouseRelationMixin as Mixin];
