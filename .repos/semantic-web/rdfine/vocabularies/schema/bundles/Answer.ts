import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnswerMixin } from '../lib/Answer.js';
import { CommentMixin } from '../lib/Comment.js';
import { WebContentMixin } from '../lib/WebContent.js';

export const AnswerBundle = [
  AnswerMixin as Mixin,
  CommentMixin as Mixin,
  WebContentMixin as Mixin];
