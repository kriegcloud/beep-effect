import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MosqueMixin } from '../lib/Mosque.js';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';

export const MosqueBundle = [
  MosqueMixin as Mixin,
  PlaceOfWorshipMixin as Mixin];
