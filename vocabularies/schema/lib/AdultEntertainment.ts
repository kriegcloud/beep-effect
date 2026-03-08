import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface AdultEntertainment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function AdultEntertainmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AdultEntertainment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AdultEntertainmentClass extends EntertainmentBusinessMixin(Resource) {
  }
  return AdultEntertainmentClass as any
}
AdultEntertainmentMixin.appliesTo = schema.AdultEntertainment
AdultEntertainmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<AdultEntertainment>([EntertainmentBusinessMixin, AdultEntertainmentMixin], { types: [schema.AdultEntertainment] }, env)
