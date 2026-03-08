import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DiscoverActionMixin } from '../lib/DiscoverAction.js';
import { FindActionMixin } from '../lib/FindAction.js';

export const DiscoverActionBundle = [
  DiscoverActionMixin as Mixin,
  FindActionMixin as Mixin];
