import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AmpStoryMixin } from '../lib/AmpStory.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const AmpStoryBundle = [
  AmpStoryMixin as Mixin,
  CreativeWorkMixin as Mixin,
  MediaObjectMixin as Mixin];
