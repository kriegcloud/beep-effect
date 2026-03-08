import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { WebPageElementMixin } from '../lib/WebPageElement.js';

export const WebPageElementBundle = [
  CreativeWorkMixin as Mixin,
  WebPageElementMixin as Mixin];
