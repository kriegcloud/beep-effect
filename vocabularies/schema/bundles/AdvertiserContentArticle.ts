import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdvertiserContentArticleMixin } from '../lib/AdvertiserContentArticle.js';
import { ArticleMixin } from '../lib/Article.js';

export const AdvertiserContentArticleBundle = [
  AdvertiserContentArticleMixin as Mixin,
  ArticleMixin as Mixin];
