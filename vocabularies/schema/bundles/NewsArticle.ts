import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';

export const NewsArticleBundle = [
  ArticleMixin as Mixin,
  NewsArticleMixin as Mixin];
