import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { WaterfallMixin } from '../lib/Waterfall.js';

export const WaterfallBundle = [
  BodyOfWaterMixin as Mixin,
  WaterfallMixin as Mixin];
