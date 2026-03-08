import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArchiveComponentMixin } from '../lib/ArchiveComponent.js';
import { ArchiveOrganizationMixin } from '../lib/ArchiveOrganization.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const ArchiveOrganizationBundle = [
  ArchiveComponentMixin as Mixin,
  ArchiveOrganizationMixin as Mixin,
  LocalBusinessMixin as Mixin];
