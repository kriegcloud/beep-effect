import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LibraryMixin } from '../lib/Library.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const LibraryBundle = [
  LibraryMixin as Mixin,
  LocalBusinessMixin as Mixin];
