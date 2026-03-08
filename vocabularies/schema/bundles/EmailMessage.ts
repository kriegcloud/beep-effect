import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmailMessageMixin } from '../lib/EmailMessage.js';
import { MessageMixin } from '../lib/Message.js';

export const EmailMessageBundle = [
  EmailMessageMixin as Mixin,
  MessageMixin as Mixin];
