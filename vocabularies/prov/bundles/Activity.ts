import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { AssociationMixin } from '../lib/Association.js';
import { CommunicationMixin } from '../lib/Communication.js';
import { EndMixin } from '../lib/End.js';
import { EntityMixin } from '../lib/Entity.js';
import { InfluenceMixin } from '../lib/Influence.js';
import { LocationMixin } from '../lib/Location.js';
import { StartMixin } from '../lib/Start.js';
import { UsageMixin } from '../lib/Usage.js';

export const ActivityBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  AssociationMixin as Mixin,
  CommunicationMixin as Mixin,
  EndMixin as Mixin,
  EntityMixin as Mixin,
  InfluenceMixin as Mixin,
  LocationMixin as Mixin,
  StartMixin as Mixin,
  UsageMixin as Mixin];
