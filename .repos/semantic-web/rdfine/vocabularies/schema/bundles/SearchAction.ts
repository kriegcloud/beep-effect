import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { SearchActionMixin } from '../lib/SearchAction.js';

export const SearchActionBundle = [
  ActionMixin as Mixin,
  SearchActionMixin as Mixin];
