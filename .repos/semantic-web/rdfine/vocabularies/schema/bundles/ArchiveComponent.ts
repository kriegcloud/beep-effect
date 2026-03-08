import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArchiveComponentMixin } from '../lib/ArchiveComponent.js';
import { ArchiveOrganizationMixin } from '../lib/ArchiveOrganization.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';

export const ArchiveComponentBundle = [
  ArchiveComponentMixin as Mixin,
  ArchiveOrganizationMixin as Mixin,
  CreativeWorkMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin];
