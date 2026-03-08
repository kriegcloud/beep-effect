import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { RightsAssignmentMixin } from '../lib/RightsAssignment.js';

export const RightsAssignmentBundle = [
  ActivityMixin as Mixin,
  RightsAssignmentMixin as Mixin];
