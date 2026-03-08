import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DepartmentStoreMixin } from '../lib/DepartmentStore.js';
import { StoreMixin } from '../lib/Store.js';

export const DepartmentStoreBundle = [
  DepartmentStoreMixin as Mixin,
  StoreMixin as Mixin];
