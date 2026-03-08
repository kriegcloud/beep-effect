import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExploreActionMixin } from '../lib/ExploreAction.js';
import { ResourceActionMixin } from '../lib/ResourceAction.js';

export const ExploreActionBundle = [
  ExploreActionMixin as Mixin,
  ResourceActionMixin as Mixin];
