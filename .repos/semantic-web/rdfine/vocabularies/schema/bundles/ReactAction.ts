import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AssessActionMixin } from '../lib/AssessAction.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const ReactActionBundle = [
  AssessActionMixin as Mixin,
  ReactActionMixin as Mixin];
