import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { HyperTocEntryMixin } from '../lib/HyperTocEntry.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const HyperTocEntryBundle = [
  CreativeWorkMixin as Mixin,
  HyperTocEntryMixin as Mixin,
  MediaObjectMixin as Mixin];
