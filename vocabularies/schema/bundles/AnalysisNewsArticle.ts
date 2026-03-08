import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnalysisNewsArticleMixin } from '../lib/AnalysisNewsArticle.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';

export const AnalysisNewsArticleBundle = [
  AnalysisNewsArticleMixin as Mixin,
  NewsArticleMixin as Mixin];
