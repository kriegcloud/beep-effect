import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MusicStoreMixin } from '../lib/MusicStore.js';
import { StoreMixin } from '../lib/Store.js';

export const MusicStoreBundle = [
  MusicStoreMixin as Mixin,
  StoreMixin as Mixin];
