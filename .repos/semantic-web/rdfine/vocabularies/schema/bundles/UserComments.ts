import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { UserCommentsMixin } from '../lib/UserComments.js';
import { UserInteractionMixin } from '../lib/UserInteraction.js';

export const UserCommentsBundle = [
  CreativeWorkMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  UserCommentsMixin as Mixin,
  UserInteractionMixin as Mixin];
