import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Person<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Agent<D>, rdfine.RdfResource<D> {
}

export function PersonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Person & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class PersonClass extends AgentMixin(Resource) {
  }
  return PersonClass as any
}
PersonMixin.appliesTo = prov.Person
PersonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Person>([AgentMixin, PersonMixin], { types: [prov.Person] }, env)
