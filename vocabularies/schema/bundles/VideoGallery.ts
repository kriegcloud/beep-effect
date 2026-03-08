import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MediaGalleryMixin } from '../lib/MediaGallery.js';
import { VideoGalleryMixin } from '../lib/VideoGallery.js';

export const VideoGalleryBundle = [
  MediaGalleryMixin as Mixin,
  VideoGalleryMixin as Mixin];
