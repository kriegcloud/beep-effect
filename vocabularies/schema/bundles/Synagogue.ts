import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';
import { SynagogueMixin } from '../lib/Synagogue.js';

export const SynagogueBundle = [
  PlaceOfWorshipMixin as Mixin,
  SynagogueMixin as Mixin];
