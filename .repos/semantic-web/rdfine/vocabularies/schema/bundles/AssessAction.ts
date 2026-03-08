import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { AssessActionMixin } from '../lib/AssessAction.js';

export const AssessActionBundle = [
  ActionMixin as Mixin,
  AssessActionMixin as Mixin];
