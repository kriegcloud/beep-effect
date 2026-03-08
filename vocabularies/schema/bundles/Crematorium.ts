import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { CrematoriumMixin } from '../lib/Crematorium.js';

export const CrematoriumBundle = [
  CivicStructureMixin as Mixin,
  CrematoriumMixin as Mixin];
