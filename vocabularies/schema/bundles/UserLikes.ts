import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserInteractionMixin } from '../lib/UserInteraction.js';
import { UserLikesMixin } from '../lib/UserLikes.js';

export const UserLikesBundle = [
  UserInteractionMixin as Mixin,
  UserLikesMixin as Mixin];
