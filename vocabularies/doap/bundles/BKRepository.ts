import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BKRepositoryMixin } from '../lib/BKRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const BKRepositoryBundle = [
  BKRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
