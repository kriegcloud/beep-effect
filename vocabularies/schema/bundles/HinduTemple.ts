import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HinduTempleMixin } from '../lib/HinduTemple.js';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';

export const HinduTempleBundle = [
  HinduTempleMixin as Mixin,
  PlaceOfWorshipMixin as Mixin];
