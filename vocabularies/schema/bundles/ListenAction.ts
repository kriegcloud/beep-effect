import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { ListenActionMixin } from '../lib/ListenAction.js';

export const ListenActionBundle = [
  ConsumeActionMixin as Mixin,
  ListenActionMixin as Mixin];
