import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AquariumMixin } from '../lib/Aquarium.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const AquariumBundle = [
  AquariumMixin as Mixin,
  CivicStructureMixin as Mixin];
