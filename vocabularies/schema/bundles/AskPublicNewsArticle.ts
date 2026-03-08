import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AskPublicNewsArticleMixin } from '../lib/AskPublicNewsArticle.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';

export const AskPublicNewsArticleBundle = [
  AskPublicNewsArticleMixin as Mixin,
  NewsArticleMixin as Mixin];
