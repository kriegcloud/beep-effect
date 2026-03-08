import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface AmusementPark<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function AmusementParkMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AmusementPark & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AmusementParkClass extends EntertainmentBusinessMixin(Resource) {
  }
  return AmusementParkClass as any
}
AmusementParkMixin.appliesTo = schema.AmusementPark
AmusementParkMixin.createFactory = (env: RdfineEnvironment) => createFactory<AmusementPark>([EntertainmentBusinessMixin, AmusementParkMixin], { types: [schema.AmusementPark] }, env)
