import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { GuideMixin } from '../lib/Guide.js';

export const GuideBundle = [
  CreativeWorkMixin as Mixin,
  GuideMixin as Mixin];
