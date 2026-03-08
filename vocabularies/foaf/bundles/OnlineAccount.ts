import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DocumentMixin } from '../lib/Document.js';
import { OnlineAccountMixin } from '../lib/OnlineAccount.js';

export const OnlineAccountBundle = [
  DocumentMixin as Mixin,
  OnlineAccountMixin as Mixin];
