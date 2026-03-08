import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComicIssueMixin } from '../lib/ComicIssue.js';
import { PersonMixin } from '../lib/Person.js';
import { PublicationIssueMixin } from '../lib/PublicationIssue.js';

export const ComicIssueBundle = [
  ComicIssueMixin as Mixin,
  PersonMixin as Mixin,
  PublicationIssueMixin as Mixin];
