import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface TaxiService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
}

export function TaxiServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TaxiService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TaxiServiceClass extends ServiceMixin(Resource) {
  }
  return TaxiServiceClass as any
}
TaxiServiceMixin.appliesTo = schema.TaxiService
TaxiServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<TaxiService>([ServiceMixin, TaxiServiceMixin], { types: [schema.TaxiService] }, env)
