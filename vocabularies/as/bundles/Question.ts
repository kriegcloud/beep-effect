import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntransitiveActivityMixin } from '../lib/IntransitiveActivity.js';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';
import { QuestionMixin } from '../lib/Question.js';

export const QuestionBundle = [
  IntransitiveActivityMixin as Mixin,
  LinkMixin as Mixin,
  ObjectMixin as Mixin,
  QuestionMixin as Mixin];
