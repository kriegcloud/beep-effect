import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';

export const ImageObjectBundle = [
  ImageObjectMixin as Mixin,
  MediaObjectMixin as Mixin,
  PropertyValueMixin as Mixin];
