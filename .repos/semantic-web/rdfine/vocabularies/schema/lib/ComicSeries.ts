import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PeriodicalMixin } from './Periodical.js';

export interface ComicSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Periodical<D>, rdfine.RdfResource<D> {
}

export function ComicSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComicSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComicSeriesClass extends PeriodicalMixin(Resource) {
  }
  return ComicSeriesClass as any
}
ComicSeriesMixin.appliesTo = schema.ComicSeries
ComicSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComicSeries>([PeriodicalMixin, ComicSeriesMixin], { types: [schema.ComicSeries] }, env)
