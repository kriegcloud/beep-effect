import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DictionaryMixin } from '../lib/Dictionary.js';
import { InsertionMixin } from '../lib/Insertion.js';
import { KeyEntityPairMixin } from '../lib/KeyEntityPair.js';
import { RemovalMixin } from '../lib/Removal.js';

export const DictionaryBundle = [
  DictionaryMixin as Mixin,
  InsertionMixin as Mixin,
  KeyEntityPairMixin as Mixin,
  RemovalMixin as Mixin];
