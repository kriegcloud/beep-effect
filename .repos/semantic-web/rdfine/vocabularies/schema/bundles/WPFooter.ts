import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { WebPageElementMixin } from '../lib/WebPageElement.js';
import { WPFooterMixin } from '../lib/WPFooter.js';

export const WPFooterBundle = [
  WebPageElementMixin as Mixin,
  WPFooterMixin as Mixin];
