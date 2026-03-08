import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { PublicToiletMixin } from '../lib/PublicToilet.js';

export const PublicToiletBundle = [
  CivicStructureMixin as Mixin,
  PublicToiletMixin as Mixin];
