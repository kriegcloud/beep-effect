import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DistanceMixin } from '../lib/Distance.js';
import { PersonMixin } from '../lib/Person.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { VisualArtworkMixin } from '../lib/VisualArtwork.js';

export const VisualArtworkBundle = [
  CreativeWorkMixin as Mixin,
  DistanceMixin as Mixin,
  PersonMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  VisualArtworkMixin as Mixin];
