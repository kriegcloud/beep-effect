import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { WebPageElementMixin } from '../lib/WebPageElement.js';
import { WPHeaderMixin } from '../lib/WPHeader.js';

export const WPHeaderBundle = [
  WebPageElementMixin as Mixin,
  WPHeaderMixin as Mixin];
