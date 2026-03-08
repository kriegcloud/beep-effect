import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnlineAccountMixin } from '../lib/OnlineAccount.js';
import { OnlineEcommerceAccountMixin } from '../lib/OnlineEcommerceAccount.js';

export const OnlineEcommerceAccountBundle = [
  OnlineAccountMixin as Mixin,
  OnlineEcommerceAccountMixin as Mixin];
