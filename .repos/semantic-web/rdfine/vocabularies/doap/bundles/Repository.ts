import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProjectMixin } from '../lib/Project.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const RepositoryBundle = [
  ProjectMixin as Mixin,
  RepositoryMixin as Mixin];
