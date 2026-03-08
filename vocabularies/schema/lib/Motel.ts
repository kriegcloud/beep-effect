import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface Motel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function MotelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Motel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MotelClass extends LodgingBusinessMixin(Resource) {
  }
  return MotelClass as any
}
MotelMixin.appliesTo = schema.Motel
MotelMixin.createFactory = (env: RdfineEnvironment) => createFactory<Motel>([LodgingBusinessMixin, MotelMixin], { types: [schema.Motel] }, env)
