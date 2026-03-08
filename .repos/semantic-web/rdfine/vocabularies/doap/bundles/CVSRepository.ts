import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CVSRepositoryMixin } from '../lib/CVSRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const CVSRepositoryBundle = [
  CVSRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
