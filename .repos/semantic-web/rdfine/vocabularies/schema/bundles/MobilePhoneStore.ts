import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MobilePhoneStoreMixin } from '../lib/MobilePhoneStore.js';
import { StoreMixin } from '../lib/Store.js';

export const MobilePhoneStoreBundle = [
  MobilePhoneStoreMixin as Mixin,
  StoreMixin as Mixin];
