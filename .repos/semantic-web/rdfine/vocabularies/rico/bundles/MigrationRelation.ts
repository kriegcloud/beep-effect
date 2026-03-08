import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationRelationMixin } from '../lib/DerivationRelation.js';
import { MigrationRelationMixin } from '../lib/MigrationRelation.js';

export const MigrationRelationBundle = [
  DerivationRelationMixin as Mixin,
  MigrationRelationMixin as Mixin];
