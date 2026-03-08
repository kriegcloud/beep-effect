import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DigitalDocumentMixin } from '../lib/DigitalDocument.js';
import { PresentationDigitalDocumentMixin } from '../lib/PresentationDigitalDocument.js';

export const PresentationDigitalDocumentBundle = [
  DigitalDocumentMixin as Mixin,
  PresentationDigitalDocumentMixin as Mixin];
