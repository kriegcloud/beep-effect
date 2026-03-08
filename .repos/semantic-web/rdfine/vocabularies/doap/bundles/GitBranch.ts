import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GitBranchMixin } from '../lib/GitBranch.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const GitBranchBundle = [
  GitBranchMixin as Mixin,
  RepositoryMixin as Mixin];
