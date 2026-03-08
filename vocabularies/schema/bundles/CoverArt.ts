import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CoverArtMixin } from '../lib/CoverArt.js';
import { VisualArtworkMixin } from '../lib/VisualArtwork.js';

export const CoverArtBundle = [
  CoverArtMixin as Mixin,
  VisualArtworkMixin as Mixin];
