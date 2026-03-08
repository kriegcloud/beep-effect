import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { SpeakableSpecificationMixin } from '../lib/SpeakableSpecification.js';

export const ArticleBundle = [
  ArticleMixin as Mixin,
  CreativeWorkMixin as Mixin,
  SpeakableSpecificationMixin as Mixin];
