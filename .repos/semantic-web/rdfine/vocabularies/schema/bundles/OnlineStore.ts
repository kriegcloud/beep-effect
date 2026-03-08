import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnlineBusinessMixin } from '../lib/OnlineBusiness.js';
import { OnlineStoreMixin } from '../lib/OnlineStore.js';

export const OnlineStoreBundle = [
  OnlineBusinessMixin as Mixin,
  OnlineStoreMixin as Mixin];
