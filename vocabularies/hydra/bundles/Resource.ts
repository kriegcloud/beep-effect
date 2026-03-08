import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IriTemplateMixin } from '../lib/IriTemplate.js';
import { OperationMixin } from '../lib/Operation.js';
import { ResourceMixin } from '../lib/Resource.js';

export const ResourceBundle = [
  IriTemplateMixin as Mixin,
  OperationMixin as Mixin,
  ResourceMixin as Mixin];
