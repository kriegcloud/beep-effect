import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AssessActionMixin } from '../lib/AssessAction.js';
import { IgnoreActionMixin } from '../lib/IgnoreAction.js';

export const IgnoreActionBundle = [
  AssessActionMixin as Mixin,
  IgnoreActionMixin as Mixin];
