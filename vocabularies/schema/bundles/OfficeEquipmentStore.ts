import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OfficeEquipmentStoreMixin } from '../lib/OfficeEquipmentStore.js';
import { StoreMixin } from '../lib/Store.js';

export const OfficeEquipmentStoreBundle = [
  OfficeEquipmentStoreMixin as Mixin,
  StoreMixin as Mixin];
