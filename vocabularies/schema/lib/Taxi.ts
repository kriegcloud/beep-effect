import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface Taxi<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
}

export function TaxiMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Taxi & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TaxiClass extends ServiceMixin(Resource) {
  }
  return TaxiClass as any
}
TaxiMixin.appliesTo = schema.Taxi
TaxiMixin.createFactory = (env: RdfineEnvironment) => createFactory<Taxi>([ServiceMixin, TaxiMixin], { types: [schema.Taxi] }, env)
