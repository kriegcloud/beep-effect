import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BoatTerminalMixin } from '../lib/BoatTerminal.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';

export const BoatTerminalBundle = [
  BoatTerminalMixin as Mixin,
  CivicStructureMixin as Mixin];
