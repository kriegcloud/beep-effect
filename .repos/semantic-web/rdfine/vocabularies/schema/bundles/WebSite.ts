import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { WebSiteMixin } from '../lib/WebSite.js';

export const WebSiteBundle = [
  CreativeWorkMixin as Mixin,
  WebSiteMixin as Mixin];
