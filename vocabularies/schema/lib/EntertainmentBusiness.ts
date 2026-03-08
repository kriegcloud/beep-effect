import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface EntertainmentBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function EntertainmentBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EntertainmentBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EntertainmentBusinessClass extends LocalBusinessMixin(Resource) {
  }
  return EntertainmentBusinessClass as any
}
EntertainmentBusinessMixin.appliesTo = schema.EntertainmentBusiness
EntertainmentBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<EntertainmentBusiness>([LocalBusinessMixin, EntertainmentBusinessMixin], { types: [schema.EntertainmentBusiness] }, env)
