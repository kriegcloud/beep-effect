import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnswerMixin } from '../lib/Answer.js';
import { CommentMixin } from '../lib/Comment.js';
import { ItemListMixin } from '../lib/ItemList.js';
import { QuestionMixin } from '../lib/Question.js';

export const QuestionBundle = [
  AnswerMixin as Mixin,
  CommentMixin as Mixin,
  ItemListMixin as Mixin,
  QuestionMixin as Mixin];
