import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DigitalDocumentMixin } from '../lib/DigitalDocument.js';
import { TextDigitalDocumentMixin } from '../lib/TextDigitalDocument.js';

export const TextDigitalDocumentBundle = [
  DigitalDocumentMixin as Mixin,
  TextDigitalDocumentMixin as Mixin];
