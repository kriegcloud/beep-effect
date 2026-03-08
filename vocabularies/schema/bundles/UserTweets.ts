import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserInteractionMixin } from '../lib/UserInteraction.js';
import { UserTweetsMixin } from '../lib/UserTweets.js';

export const UserTweetsBundle = [
  UserInteractionMixin as Mixin,
  UserTweetsMixin as Mixin];
