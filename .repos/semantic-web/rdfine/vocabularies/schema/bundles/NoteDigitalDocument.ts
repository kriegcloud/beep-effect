import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DigitalDocumentMixin } from '../lib/DigitalDocument.js';
import { NoteDigitalDocumentMixin } from '../lib/NoteDigitalDocument.js';

export const NoteDigitalDocumentBundle = [
  DigitalDocumentMixin as Mixin,
  NoteDigitalDocumentMixin as Mixin];
