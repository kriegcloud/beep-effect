import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';

export interface TattooParlor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, rdfine.RdfResource<D> {
}

export function TattooParlorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TattooParlor & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TattooParlorClass extends HealthAndBeautyBusinessMixin(Resource) {
  }
  return TattooParlorClass as any
}
TattooParlorMixin.appliesTo = schema.TattooParlor
TattooParlorMixin.createFactory = (env: RdfineEnvironment) => createFactory<TattooParlor>([HealthAndBeautyBusinessMixin, TattooParlorMixin], { types: [schema.TattooParlor] }, env)
