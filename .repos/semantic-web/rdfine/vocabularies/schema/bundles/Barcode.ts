import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BarcodeMixin } from '../lib/Barcode.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';

export const BarcodeBundle = [
  BarcodeMixin as Mixin,
  ImageObjectMixin as Mixin];
