import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClipMixin } from '../lib/Clip.js';
import { MovieClipMixin } from '../lib/MovieClip.js';

export const MovieClipBundle = [
  ClipMixin as Mixin,
  MovieClipMixin as Mixin];
