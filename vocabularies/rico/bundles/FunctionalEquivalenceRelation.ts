import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FunctionalEquivalenceRelationMixin } from '../lib/FunctionalEquivalenceRelation.js';
import { InstantiationToInstantiationRelationMixin } from '../lib/InstantiationToInstantiationRelation.js';

export const FunctionalEquivalenceRelationBundle = [
  FunctionalEquivalenceRelationMixin as Mixin,
  InstantiationToInstantiationRelationMixin as Mixin];
