import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProjectMixin } from '../lib/Project.js';
import { ResearchProjectMixin } from '../lib/ResearchProject.js';

export const ResearchProjectBundle = [
  ProjectMixin as Mixin,
  ResearchProjectMixin as Mixin];
