import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLUpdateSuggestionGeneratorMixin } from '../lib/SPARQLUpdateSuggestionGenerator.js';
import { SuggestionGeneratorMixin } from '../lib/SuggestionGenerator.js';

export const SPARQLUpdateSuggestionGeneratorBundle = [
  SPARQLUpdateSuggestionGeneratorMixin as Mixin,
  SuggestionGeneratorMixin as Mixin];
