import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DocumentMixin } from '../lib/Document.js';
import { ObjectMixin } from '../lib/Object.js';

export const DocumentBundle = [
  DocumentMixin as Mixin,
  ObjectMixin as Mixin];
