import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface TelevisionStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function TelevisionStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TelevisionStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TelevisionStationClass extends LocalBusinessMixin(Resource) {
  }
  return TelevisionStationClass as any
}
TelevisionStationMixin.appliesTo = schema.TelevisionStation
TelevisionStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TelevisionStation>([LocalBusinessMixin, TelevisionStationMixin], { types: [schema.TelevisionStation] }, env)
