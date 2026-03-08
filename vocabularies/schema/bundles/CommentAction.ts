import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommentActionMixin } from '../lib/CommentAction.js';
import { CommentMixin } from '../lib/Comment.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';

export const CommentActionBundle = [
  CommentActionMixin as Mixin,
  CommentMixin as Mixin,
  CommunicateActionMixin as Mixin];
