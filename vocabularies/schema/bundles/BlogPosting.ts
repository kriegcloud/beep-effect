import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BlogPostingMixin } from '../lib/BlogPosting.js';
import { SocialMediaPostingMixin } from '../lib/SocialMediaPosting.js';

export const BlogPostingBundle = [
  BlogPostingMixin as Mixin,
  SocialMediaPostingMixin as Mixin];
