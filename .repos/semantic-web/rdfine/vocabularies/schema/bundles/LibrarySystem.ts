import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LibrarySystemMixin } from '../lib/LibrarySystem.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const LibrarySystemBundle = [
  LibrarySystemMixin as Mixin,
  OrganizationMixin as Mixin];
