import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GitRepositoryMixin } from '../lib/GitRepository.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const GitRepositoryBundle = [
  GitRepositoryMixin as Mixin,
  RepositoryMixin as Mixin];
