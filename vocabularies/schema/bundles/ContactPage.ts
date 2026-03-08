import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContactPageMixin } from '../lib/ContactPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const ContactPageBundle = [
  ContactPageMixin as Mixin,
  WebPageMixin as Mixin];
