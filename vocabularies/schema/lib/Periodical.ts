import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeriesMixin } from './CreativeWorkSeries.js';

export interface Periodical<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeries<D>, rdfine.RdfResource<D> {
}

export function PeriodicalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Periodical & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PeriodicalClass extends CreativeWorkSeriesMixin(Resource) {
  }
  return PeriodicalClass as any
}
PeriodicalMixin.appliesTo = schema.Periodical
PeriodicalMixin.createFactory = (env: RdfineEnvironment) => createFactory<Periodical>([CreativeWorkSeriesMixin, PeriodicalMixin], { types: [schema.Periodical] }, env)
