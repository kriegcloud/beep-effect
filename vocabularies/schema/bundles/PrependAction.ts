import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InsertActionMixin } from '../lib/InsertAction.js';
import { PrependActionMixin } from '../lib/PrependAction.js';

export const PrependActionBundle = [
  InsertActionMixin as Mixin,
  PrependActionMixin as Mixin];
