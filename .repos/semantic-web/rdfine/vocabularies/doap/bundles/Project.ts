import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProjectMixin } from '../lib/Project.js';
import { RepositoryMixin } from '../lib/Repository.js';
import { SpecificationMixin } from '../lib/Specification.js';
import { VersionMixin } from '../lib/Version.js';

export const ProjectBundle = [
  ProjectMixin as Mixin,
  RepositoryMixin as Mixin,
  SpecificationMixin as Mixin,
  VersionMixin as Mixin];
