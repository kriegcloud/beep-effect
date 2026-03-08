import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { TombstoneMixin } from '../lib/Tombstone.js';

export const TombstoneBundle = [
  ObjectMixin as Mixin,
  TombstoneMixin as Mixin];
