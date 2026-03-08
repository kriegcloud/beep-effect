import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { TechArticleMixin } from '../lib/TechArticle.js';

export const TechArticleBundle = [
  ArticleMixin as Mixin,
  TechArticleMixin as Mixin];
