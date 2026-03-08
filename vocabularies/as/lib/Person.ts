import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Person<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function PersonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Person & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class PersonClass extends ObjectMixin(Resource) {
  }
  return PersonClass as any
}
PersonMixin.appliesTo = as.Person
PersonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Person>([ObjectMixin, PersonMixin], { types: [as.Person] }, env)
