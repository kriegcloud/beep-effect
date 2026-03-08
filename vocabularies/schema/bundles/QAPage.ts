import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { QAPageMixin } from '../lib/QAPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const QAPageBundle = [
  QAPageMixin as Mixin,
  WebPageMixin as Mixin];
