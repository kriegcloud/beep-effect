import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComicCoverArtMixin } from '../lib/ComicCoverArt.js';
import { ComicStoryMixin } from '../lib/ComicStory.js';
import { CoverArtMixin } from '../lib/CoverArt.js';

export const ComicCoverArtBundle = [
  ComicCoverArtMixin as Mixin,
  ComicStoryMixin as Mixin,
  CoverArtMixin as Mixin];
