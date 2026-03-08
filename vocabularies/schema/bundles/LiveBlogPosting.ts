import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BlogPostingMixin } from '../lib/BlogPosting.js';
import { LiveBlogPostingMixin } from '../lib/LiveBlogPosting.js';

export const LiveBlogPostingBundle = [
  BlogPostingMixin as Mixin,
  LiveBlogPostingMixin as Mixin];
