import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DislikeActionMixin } from '../lib/DislikeAction.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const DislikeActionBundle = [
  DislikeActionMixin as Mixin,
  ReactActionMixin as Mixin];
