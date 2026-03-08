import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface Resort<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function ResortMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Resort & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResortClass extends LodgingBusinessMixin(Resource) {
  }
  return ResortClass as any
}
ResortMixin.appliesTo = schema.Resort
ResortMixin.createFactory = (env: RdfineEnvironment) => createFactory<Resort>([LodgingBusinessMixin, ResortMixin], { types: [schema.Resort] }, env)
