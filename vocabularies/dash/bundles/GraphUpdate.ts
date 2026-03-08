import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GraphUpdateMixin } from '../lib/GraphUpdate.js';
import { SuggestionMixin } from '../lib/Suggestion.js';

export const GraphUpdateBundle = [
  GraphUpdateMixin as Mixin,
  SuggestionMixin as Mixin];
