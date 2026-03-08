import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { SelfStorageMixin } from '../lib/SelfStorage.js';

export const SelfStorageBundle = [
  LocalBusinessMixin as Mixin,
  SelfStorageMixin as Mixin];
