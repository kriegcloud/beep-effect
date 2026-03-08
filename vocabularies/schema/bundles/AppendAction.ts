import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AppendActionMixin } from '../lib/AppendAction.js';
import { InsertActionMixin } from '../lib/InsertAction.js';

export const AppendActionBundle = [
  AppendActionMixin as Mixin,
  InsertActionMixin as Mixin];
