import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnlineAccountMixin } from '../lib/OnlineAccount.js';
import { OnlineGamingAccountMixin } from '../lib/OnlineGamingAccount.js';

export const OnlineGamingAccountBundle = [
  OnlineAccountMixin as Mixin,
  OnlineGamingAccountMixin as Mixin];
