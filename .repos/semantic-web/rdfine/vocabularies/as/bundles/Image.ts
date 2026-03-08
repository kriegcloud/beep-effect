import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DocumentMixin } from '../lib/Document.js';
import { ImageMixin } from '../lib/Image.js';

export const ImageBundle = [
  DocumentMixin as Mixin,
  ImageMixin as Mixin];
