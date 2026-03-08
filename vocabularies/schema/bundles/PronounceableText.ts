import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LanguageMixin } from '../lib/Language.js';
import { PronounceableTextMixin } from '../lib/PronounceableText.js';

export const PronounceableTextBundle = [
  LanguageMixin as Mixin,
  PronounceableTextMixin as Mixin];
