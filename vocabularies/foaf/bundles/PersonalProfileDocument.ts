import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DocumentMixin } from '../lib/Document.js';
import { PersonalProfileDocumentMixin } from '../lib/PersonalProfileDocument.js';

export const PersonalProfileDocumentBundle = [
  DocumentMixin as Mixin,
  PersonalProfileDocumentMixin as Mixin];
