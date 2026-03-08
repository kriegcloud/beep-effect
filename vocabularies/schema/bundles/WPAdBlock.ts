import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { WebPageElementMixin } from '../lib/WebPageElement.js';
import { WPAdBlockMixin } from '../lib/WPAdBlock.js';

export const WPAdBlockBundle = [
  WebPageElementMixin as Mixin,
  WPAdBlockMixin as Mixin];
