import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { WatchActionMixin } from '../lib/WatchAction.js';

export const WatchActionBundle = [
  ConsumeActionMixin as Mixin,
  WatchActionMixin as Mixin];
