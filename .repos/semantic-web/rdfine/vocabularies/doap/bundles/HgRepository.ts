import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HgRepositoryMixin } from '../lib/HgRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const HgRepositoryBundle = [
  HgRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
