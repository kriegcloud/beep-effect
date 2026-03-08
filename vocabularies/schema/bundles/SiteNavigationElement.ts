import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SiteNavigationElementMixin } from '../lib/SiteNavigationElement.js';
import { WebPageElementMixin } from '../lib/WebPageElement.js';

export const SiteNavigationElementBundle = [
  SiteNavigationElementMixin as Mixin,
  WebPageElementMixin as Mixin];
