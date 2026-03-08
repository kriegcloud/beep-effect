import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';
import { RelationshipMixin } from '../lib/Relationship.js';

export const RelationshipBundle = [
  LinkMixin as Mixin,
  ObjectMixin as Mixin,
  RelationshipMixin as Mixin];
