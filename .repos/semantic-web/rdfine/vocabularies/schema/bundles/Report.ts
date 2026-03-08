import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArticleMixin } from '../lib/Article.js';
import { ReportMixin } from '../lib/Report.js';

export const ReportBundle = [
  ArticleMixin as Mixin,
  ReportMixin as Mixin];
