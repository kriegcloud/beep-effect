import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DigitalDocumentMixin } from '../lib/DigitalDocument.js';
import { SpreadsheetDigitalDocumentMixin } from '../lib/SpreadsheetDigitalDocument.js';

export const SpreadsheetDigitalDocumentBundle = [
  DigitalDocumentMixin as Mixin,
  SpreadsheetDigitalDocumentMixin as Mixin];
