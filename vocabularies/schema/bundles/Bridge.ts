import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BridgeMixin } from '../lib/Bridge.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const BridgeBundle = [
  BridgeMixin as Mixin,
  CivicStructureMixin as Mixin];
