import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClipMixin } from '../lib/Clip.js';
import { VideoGameClipMixin } from '../lib/VideoGameClip.js';

export const VideoGameClipBundle = [
  ClipMixin as Mixin,
  VideoGameClipMixin as Mixin];
