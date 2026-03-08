import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { LanguageMixin } from '../lib/Language.js';

export const LanguageBundle = [
  IntangibleMixin as Mixin,
  LanguageMixin as Mixin];
