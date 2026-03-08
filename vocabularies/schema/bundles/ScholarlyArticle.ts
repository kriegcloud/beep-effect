import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { ScholarlyArticleMixin } from '../lib/ScholarlyArticle.js';

export const ScholarlyArticleBundle = [
  ArticleMixin as Mixin,
  ScholarlyArticleMixin as Mixin];
