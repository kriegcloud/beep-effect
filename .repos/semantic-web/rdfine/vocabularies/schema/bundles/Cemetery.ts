import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CemeteryMixin } from '../lib/Cemetery.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const CemeteryBundle = [
  CemeteryMixin as Mixin,
  CivicStructureMixin as Mixin];
