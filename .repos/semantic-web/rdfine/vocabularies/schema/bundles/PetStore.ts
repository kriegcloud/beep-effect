import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PetStoreMixin } from '../lib/PetStore.js';
import { StoreMixin } from '../lib/Store.js';

export const PetStoreBundle = [
  PetStoreMixin as Mixin,
  StoreMixin as Mixin];
