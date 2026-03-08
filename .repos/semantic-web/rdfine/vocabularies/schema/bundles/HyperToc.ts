import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { HyperTocEntryMixin } from '../lib/HyperTocEntry.js';
import { HyperTocMixin } from '../lib/HyperToc.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const HyperTocBundle = [
  CreativeWorkMixin as Mixin,
  HyperTocEntryMixin as Mixin,
  HyperTocMixin as Mixin,
  MediaObjectMixin as Mixin];
