import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BeachMixin } from '../lib/Beach.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const BeachBundle = [
  BeachMixin as Mixin,
  CivicStructureMixin as Mixin];
