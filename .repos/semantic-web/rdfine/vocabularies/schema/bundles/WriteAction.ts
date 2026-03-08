import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { LanguageMixin } from '../lib/Language.js';
import { WriteActionMixin } from '../lib/WriteAction.js';

export const WriteActionBundle = [
  CreateActionMixin as Mixin,
  LanguageMixin as Mixin,
  WriteActionMixin as Mixin];
