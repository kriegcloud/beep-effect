import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { StoreMixin } from '../lib/Store.js';

export const StoreBundle = [
  LocalBusinessMixin as Mixin,
  StoreMixin as Mixin];
