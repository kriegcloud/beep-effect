import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AboutPageMixin } from '../lib/AboutPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const AboutPageBundle = [
  AboutPageMixin as Mixin,
  WebPageMixin as Mixin];
