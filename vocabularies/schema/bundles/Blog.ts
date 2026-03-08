import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BlogMixin } from '../lib/Blog.js';
import { BlogPostingMixin } from '../lib/BlogPosting.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const BlogBundle = [
  BlogMixin as Mixin,
  BlogPostingMixin as Mixin,
  CreativeWorkMixin as Mixin];
