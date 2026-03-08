import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArtGalleryMixin } from '../lib/ArtGallery.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';

export const ArtGalleryBundle = [
  ArtGalleryMixin as Mixin,
  EntertainmentBusinessMixin as Mixin];
