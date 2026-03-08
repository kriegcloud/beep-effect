import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { DocumentMixin } from '../lib/Document.js';
import { ImageMixin } from '../lib/Image.js';
import { PersonMixin } from '../lib/Person.js';

export const PersonBundle = [
  AgentMixin as Mixin,
  DocumentMixin as Mixin,
  ImageMixin as Mixin,
  PersonMixin as Mixin];
