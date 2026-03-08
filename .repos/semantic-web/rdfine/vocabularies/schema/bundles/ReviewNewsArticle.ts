import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CriticReviewMixin } from '../lib/CriticReview.js';
import { NewsArticleMixin } from '../lib/NewsArticle.js';
import { ReviewNewsArticleMixin } from '../lib/ReviewNewsArticle.js';

export const ReviewNewsArticleBundle = [
  CriticReviewMixin as Mixin,
  NewsArticleMixin as Mixin,
  ReviewNewsArticleMixin as Mixin];
