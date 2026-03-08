import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface Casino<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function CasinoMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Casino & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CasinoClass extends EntertainmentBusinessMixin(Resource) {
  }
  return CasinoClass as any
}
CasinoMixin.appliesTo = schema.Casino
CasinoMixin.createFactory = (env: RdfineEnvironment) => createFactory<Casino>([EntertainmentBusinessMixin, CasinoMixin], { types: [schema.Casino] }, env)
