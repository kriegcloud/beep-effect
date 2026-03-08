import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgreeActionMixin } from '../lib/AgreeAction.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const AgreeActionBundle = [
  AgreeActionMixin as Mixin,
  ReactActionMixin as Mixin];
