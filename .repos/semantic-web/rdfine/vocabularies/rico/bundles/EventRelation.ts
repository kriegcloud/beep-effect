import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventRelationMixin } from '../lib/EventRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const EventRelationBundle = [
  EventRelationMixin as Mixin,
  RelationMixin as Mixin];
