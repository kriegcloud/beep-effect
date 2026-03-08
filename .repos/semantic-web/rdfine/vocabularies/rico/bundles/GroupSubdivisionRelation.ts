import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentHierarchicalRelationMixin } from '../lib/AgentHierarchicalRelation.js';
import { GroupSubdivisionRelationMixin } from '../lib/GroupSubdivisionRelation.js';
import { WholePartRelationMixin } from '../lib/WholePartRelation.js';

export const GroupSubdivisionRelationBundle = [
  AgentHierarchicalRelationMixin as Mixin,
  GroupSubdivisionRelationMixin as Mixin,
  WholePartRelationMixin as Mixin];
