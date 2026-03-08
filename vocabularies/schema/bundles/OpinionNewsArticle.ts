import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NewsArticleMixin } from '../lib/NewsArticle.js';
import { OpinionNewsArticleMixin } from '../lib/OpinionNewsArticle.js';

export const OpinionNewsArticleBundle = [
  NewsArticleMixin as Mixin,
  OpinionNewsArticleMixin as Mixin];
