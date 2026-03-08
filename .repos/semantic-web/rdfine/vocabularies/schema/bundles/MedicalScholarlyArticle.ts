import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalScholarlyArticleMixin } from '../lib/MedicalScholarlyArticle.js';
import { ScholarlyArticleMixin } from '../lib/ScholarlyArticle.js';

export const MedicalScholarlyArticleBundle = [
  MedicalScholarlyArticleMixin as Mixin,
  ScholarlyArticleMixin as Mixin];
