import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClipMixin } from '../lib/Clip.js';
import { RadioClipMixin } from '../lib/RadioClip.js';

export const RadioClipBundle = [
  ClipMixin as Mixin,
  RadioClipMixin as Mixin];
