import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ImageGalleryMixin } from '../lib/ImageGallery.js';
import { MediaGalleryMixin } from '../lib/MediaGallery.js';

export const ImageGalleryBundle = [
  ImageGalleryMixin as Mixin,
  MediaGalleryMixin as Mixin];
