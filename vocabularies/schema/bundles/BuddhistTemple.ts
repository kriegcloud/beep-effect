import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BuddhistTempleMixin } from '../lib/BuddhistTemple.js';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';

export const BuddhistTempleBundle = [
  BuddhistTempleMixin as Mixin,
  PlaceOfWorshipMixin as Mixin];
