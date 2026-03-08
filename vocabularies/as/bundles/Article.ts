import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { ObjectMixin } from '../lib/Object.js';

export const ArticleBundle = [
  ArticleMixin as Mixin,
  ObjectMixin as Mixin];
