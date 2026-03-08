import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { GroupMixin } from '../lib/Group.js';

export const GroupBundle = [
  AgentMixin as Mixin,
  GroupMixin as Mixin];
