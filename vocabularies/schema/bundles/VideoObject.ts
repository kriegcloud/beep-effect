import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { PersonMixin } from '../lib/Person.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const VideoObjectBundle = [
  ImageObjectMixin as Mixin,
  MediaObjectMixin as Mixin,
  MusicGroupMixin as Mixin,
  PersonMixin as Mixin,
  VideoObjectMixin as Mixin];
