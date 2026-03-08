import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { MusicVideoObjectMixin } from '../lib/MusicVideoObject.js';

export const MusicVideoObjectBundle = [
  MediaObjectMixin as Mixin,
  MusicVideoObjectMixin as Mixin];
