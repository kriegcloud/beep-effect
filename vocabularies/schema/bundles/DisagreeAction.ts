import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DisagreeActionMixin } from '../lib/DisagreeAction.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const DisagreeActionBundle = [
  DisagreeActionMixin as Mixin,
  ReactActionMixin as Mixin];
