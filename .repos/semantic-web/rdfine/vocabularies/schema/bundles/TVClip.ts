import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClipMixin } from '../lib/Clip.js';
import { TVClipMixin } from '../lib/TVClip.js';
import { TVSeriesMixin } from '../lib/TVSeries.js';

export const TVClipBundle = [
  ClipMixin as Mixin,
  TVClipMixin as Mixin,
  TVSeriesMixin as Mixin];
