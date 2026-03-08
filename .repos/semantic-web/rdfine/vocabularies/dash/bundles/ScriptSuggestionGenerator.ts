import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptMixin } from '../lib/Script.js';
import { ScriptSuggestionGeneratorMixin } from '../lib/ScriptSuggestionGenerator.js';
import { SuggestionGeneratorMixin } from '../lib/SuggestionGenerator.js';

export const ScriptSuggestionGeneratorBundle = [
  ScriptMixin as Mixin,
  ScriptSuggestionGeneratorMixin as Mixin,
  SuggestionGeneratorMixin as Mixin];
