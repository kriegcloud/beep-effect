import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DiscussionForumPostingMixin } from '../lib/DiscussionForumPosting.js';
import { SocialMediaPostingMixin } from '../lib/SocialMediaPosting.js';

export const DiscussionForumPostingBundle = [
  DiscussionForumPostingMixin as Mixin,
  SocialMediaPostingMixin as Mixin];
