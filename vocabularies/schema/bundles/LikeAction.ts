import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LikeActionMixin } from '../lib/LikeAction.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const LikeActionBundle = [
  LikeActionMixin as Mixin,
  ReactActionMixin as Mixin];
