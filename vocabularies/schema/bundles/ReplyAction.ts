import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommentMixin } from '../lib/Comment.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { ReplyActionMixin } from '../lib/ReplyAction.js';

export const ReplyActionBundle = [
  CommentMixin as Mixin,
  CommunicateActionMixin as Mixin,
  ReplyActionMixin as Mixin];
