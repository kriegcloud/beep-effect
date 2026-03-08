import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PublicationIssueMixin } from '../lib/PublicationIssue.js';

export const PublicationIssueBundle = [
  CreativeWorkMixin as Mixin,
  PublicationIssueMixin as Mixin];
