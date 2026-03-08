import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComputerLanguageMixin } from '../lib/ComputerLanguage.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const ComputerLanguageBundle = [
  ComputerLanguageMixin as Mixin,
  IntangibleMixin as Mixin];
