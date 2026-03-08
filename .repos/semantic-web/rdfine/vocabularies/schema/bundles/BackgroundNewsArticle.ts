import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BackgroundNewsArticleMixin } from '../lib/BackgroundNewsArticle.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';

export const BackgroundNewsArticleBundle = [
  BackgroundNewsArticleMixin as Mixin,
  NewsArticleMixin as Mixin];
