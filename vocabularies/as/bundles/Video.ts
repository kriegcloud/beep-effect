import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DocumentMixin } from '../lib/Document.js';
import { VideoMixin } from '../lib/Video.js';

export const VideoBundle = [
  DocumentMixin as Mixin,
  VideoMixin as Mixin];
