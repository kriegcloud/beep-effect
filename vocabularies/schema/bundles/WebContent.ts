import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { WebContentMixin } from '../lib/WebContent.js';

export const WebContentBundle = [
  CreativeWorkMixin as Mixin,
  WebContentMixin as Mixin];
