import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BazaarBranchMixin } from '../lib/BazaarBranch.js';
import { RepositoryMixin } from '../lib/Repository.js';

export const BazaarBranchBundle = [
  BazaarBranchMixin as Mixin,
  RepositoryMixin as Mixin];
