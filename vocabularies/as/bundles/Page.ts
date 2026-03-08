import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { PageMixin } from '../lib/Page.js';

export const PageBundle = [
  ObjectMixin as Mixin,
  PageMixin as Mixin];
