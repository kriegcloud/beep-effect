import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationMixin } from '../lib/Derivation.js';
import { DictionaryMixin } from '../lib/Dictionary.js';
import { RemovalMixin } from '../lib/Removal.js';

export const RemovalBundle = [
  DerivationMixin as Mixin,
  DictionaryMixin as Mixin,
  RemovalMixin as Mixin];
