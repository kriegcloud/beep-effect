import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkSeriesMixin } from './CreativeWorkSeries.js';

export interface BookSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWorkSeries<D>, rdfine.RdfResource<D> {
}

export function BookSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BookSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BookSeriesClass extends CreativeWorkSeriesMixin(Resource) {
  }
  return BookSeriesClass as any
}
BookSeriesMixin.appliesTo = schema.BookSeries
BookSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<BookSeries>([CreativeWorkSeriesMixin, BookSeriesMixin], { types: [schema.BookSeries] }, env)
