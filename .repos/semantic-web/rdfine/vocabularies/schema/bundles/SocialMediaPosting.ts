import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { SocialMediaPostingMixin } from '../lib/SocialMediaPosting.js';

export const SocialMediaPostingBundle = [
  ArticleMixin as Mixin,
  CreativeWorkMixin as Mixin,
  SocialMediaPostingMixin as Mixin];
