import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DictionaryMixin } from '../lib/Dictionary.js';
import { EmptyCollectionMixin } from '../lib/EmptyCollection.js';
import { EmptyDictionaryMixin } from '../lib/EmptyDictionary.js';

export const EmptyDictionaryBundle = [
  DictionaryMixin as Mixin,
  EmptyCollectionMixin as Mixin,
  EmptyDictionaryMixin as Mixin];
