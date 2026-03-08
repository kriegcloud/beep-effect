import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnlineAccountMixin } from '../lib/OnlineAccount.js';
import { OnlineChatAccountMixin } from '../lib/OnlineChatAccount.js';

export const OnlineChatAccountBundle = [
  OnlineAccountMixin as Mixin,
  OnlineChatAccountMixin as Mixin];
