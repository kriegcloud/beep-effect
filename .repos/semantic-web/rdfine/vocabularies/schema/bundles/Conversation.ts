import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConversationMixin } from '../lib/Conversation.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const ConversationBundle = [
  ConversationMixin as Mixin,
  CreativeWorkMixin as Mixin];
