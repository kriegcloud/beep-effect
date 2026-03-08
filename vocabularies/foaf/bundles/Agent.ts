import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { DocumentMixin } from '../lib/Document.js';
import { OnlineAccountMixin } from '../lib/OnlineAccount.js';

export const AgentBundle = [
  AgentMixin as Mixin,
  DocumentMixin as Mixin,
  OnlineAccountMixin as Mixin];
