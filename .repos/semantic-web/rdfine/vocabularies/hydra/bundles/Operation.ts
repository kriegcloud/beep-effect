import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ClassMixin } from '../lib/Class.js';
import { HeaderSpecificationMixin } from '../lib/HeaderSpecification.js';
import { OperationMixin } from '../lib/Operation.js';
import { ResourceMixin } from '../lib/Resource.js';
import { StatusMixin } from '../lib/Status.js';

export const OperationBundle = [
  ClassMixin as Mixin,
  HeaderSpecificationMixin as Mixin,
  OperationMixin as Mixin,
  ResourceMixin as Mixin,
  StatusMixin as Mixin];
