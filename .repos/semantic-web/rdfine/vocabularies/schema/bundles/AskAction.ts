import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AskActionMixin } from '../lib/AskAction.js';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { QuestionMixin } from '../lib/Question.js';

export const AskActionBundle = [
  AskActionMixin as Mixin,
  CommunicateActionMixin as Mixin,
  QuestionMixin as Mixin];
