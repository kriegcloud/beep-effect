import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArchRepositoryMixin } from '../lib/ArchRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const ArchRepositoryBundle = [
  ArchRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
