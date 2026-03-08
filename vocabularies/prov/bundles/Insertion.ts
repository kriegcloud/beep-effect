import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationMixin } from '../lib/Derivation.js';
import { DictionaryMixin } from '../lib/Dictionary.js';
import { InsertionMixin } from '../lib/Insertion.js';
import { KeyEntityPairMixin } from '../lib/KeyEntityPair.js';

export const InsertionBundle = [
  DerivationMixin as Mixin,
  DictionaryMixin as Mixin,
  InsertionMixin as Mixin,
  KeyEntityPairMixin as Mixin];
