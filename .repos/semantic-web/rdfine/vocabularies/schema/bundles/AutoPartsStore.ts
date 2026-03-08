import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { AutoPartsStoreMixin } from '../lib/AutoPartsStore.js';
import { StoreMixin } from '../lib/Store.js';

export const AutoPartsStoreBundle = [
  AutomotiveBusinessMixin as Mixin,
  AutoPartsStoreMixin as Mixin,
  StoreMixin as Mixin];
