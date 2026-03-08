import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Service<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function ServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Service & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ServiceClass extends ObjectMixin(Resource) {
  }
  return ServiceClass as any
}
ServiceMixin.appliesTo = as.Service
ServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Service>([ObjectMixin, ServiceMixin], { types: [as.Service] }, env)
