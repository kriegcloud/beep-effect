import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudioMixin } from '../lib/Audio.js';
import { DocumentMixin } from '../lib/Document.js';

export const AudioBundle = [
  AudioMixin as Mixin,
  DocumentMixin as Mixin];
