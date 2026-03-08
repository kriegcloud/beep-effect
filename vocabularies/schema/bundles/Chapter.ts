import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChapterMixin } from '../lib/Chapter.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const ChapterBundle = [
  ChapterMixin as Mixin,
  CreativeWorkMixin as Mixin];
