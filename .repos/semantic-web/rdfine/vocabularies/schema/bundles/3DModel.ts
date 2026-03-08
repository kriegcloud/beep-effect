import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { _3DModelMixin } from '../lib/3DModel.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const _3DModelBundle = [
  _3DModelMixin as Mixin,
  MediaObjectMixin as Mixin];
