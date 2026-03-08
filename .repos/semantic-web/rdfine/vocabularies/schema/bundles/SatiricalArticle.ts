import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { SatiricalArticleMixin } from '../lib/SatiricalArticle.js';

export const SatiricalArticleBundle = [
  ArticleMixin as Mixin,
  SatiricalArticleMixin as Mixin];
