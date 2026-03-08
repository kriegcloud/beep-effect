import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Group<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function GroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Group & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class GroupClass extends ObjectMixin(Resource) {
  }
  return GroupClass as any
}
GroupMixin.appliesTo = as.Group
GroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<Group>([ObjectMixin, GroupMixin], { types: [as.Group] }, env)
