import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentTemporalRelationMixin } from '../lib/AgentTemporalRelation.js';
import { DescendanceRelationMixin } from '../lib/DescendanceRelation.js';
import { FamilyRelationMixin } from '../lib/FamilyRelation.js';

export const DescendanceRelationBundle = [
  AgentTemporalRelationMixin as Mixin,
  DescendanceRelationMixin as Mixin,
  FamilyRelationMixin as Mixin];
