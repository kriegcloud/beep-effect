import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FAQPageMixin } from '../lib/FAQPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const FAQPageBundle = [
  FAQPageMixin as Mixin,
  WebPageMixin as Mixin];
