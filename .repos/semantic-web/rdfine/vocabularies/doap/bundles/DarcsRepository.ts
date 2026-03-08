import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DarcsRepositoryMixin } from '../lib/DarcsRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const DarcsRepositoryBundle = [
  DarcsRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
