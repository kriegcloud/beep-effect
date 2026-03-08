import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { RepositoryMixin } from '../lib/Repository.js';
import { SVNRepositoryMixin } from '../lib/SVNRepository.js';

export const SVNRepositoryBundle = [
  RepositoryMixin as Mixin,
  SVNRepositoryMixin as Mixin];
