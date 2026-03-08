import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComicStoryMixin } from '../lib/ComicStory.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PersonMixin } from '../lib/Person.js';

export const ComicStoryBundle = [
  ComicStoryMixin as Mixin,
  CreativeWorkMixin as Mixin,
  PersonMixin as Mixin];
