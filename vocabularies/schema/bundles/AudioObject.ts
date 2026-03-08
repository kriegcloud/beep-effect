import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudioObjectMixin } from '../lib/AudioObject.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const AudioObjectBundle = [
  AudioObjectMixin as Mixin,
  MediaObjectMixin as Mixin];
