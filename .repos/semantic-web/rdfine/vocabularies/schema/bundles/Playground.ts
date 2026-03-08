import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { PlaygroundMixin } from '../lib/Playground.js';

export const PlaygroundBundle = [
  CivicStructureMixin as Mixin,
  PlaygroundMixin as Mixin];
