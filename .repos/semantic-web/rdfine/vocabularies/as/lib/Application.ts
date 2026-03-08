import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Application<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function ApplicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Application & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ApplicationClass extends ObjectMixin(Resource) {
  }
  return ApplicationClass as any
}
ApplicationMixin.appliesTo = as.Application
ApplicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Application>([ObjectMixin, ApplicationMixin], { types: [as.Application] }, env)
