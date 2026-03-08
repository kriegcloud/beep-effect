import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';
import { StadiumOrArenaMixin } from '../lib/StadiumOrArena.js';

export const StadiumOrArenaBundle = [
  CivicStructureMixin as Mixin,
  SportsActivityLocationMixin as Mixin,
  StadiumOrArenaMixin as Mixin];
