import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { LikeMixin } from '../lib/Like.js';

export const LikeBundle = [
  ActivityMixin as Mixin,
  LikeMixin as Mixin];
