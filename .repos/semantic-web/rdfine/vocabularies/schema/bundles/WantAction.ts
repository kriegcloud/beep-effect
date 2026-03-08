import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ReactActionMixin } from '../lib/ReactAction.js';
import { WantActionMixin } from '../lib/WantAction.js';

export const WantActionBundle = [
  ReactActionMixin as Mixin,
  WantActionMixin as Mixin];
