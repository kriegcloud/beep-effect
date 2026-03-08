import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NewsArticleMixin } from '../lib/NewsArticle.js';
import { ReportageNewsArticleMixin } from '../lib/ReportageNewsArticle.js';

export const ReportageNewsArticleBundle = [
  NewsArticleMixin as Mixin,
  ReportageNewsArticleMixin as Mixin];
