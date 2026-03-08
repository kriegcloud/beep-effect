import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChurchMixin } from '../lib/Church.js';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';

export const ChurchBundle = [
  ChurchMixin as Mixin,
  PlaceOfWorshipMixin as Mixin];
