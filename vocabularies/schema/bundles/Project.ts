import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { ProjectMixin } from '../lib/Project.js';

export const ProjectBundle = [
  OrganizationMixin as Mixin,
  ProjectMixin as Mixin];
