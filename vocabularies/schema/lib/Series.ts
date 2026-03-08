import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Series<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
}

export function SeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Series & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SeriesClass extends IntangibleMixin(Resource) {
  }
  return SeriesClass as any
}
SeriesMixin.appliesTo = schema.Series
SeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<Series>([IntangibleMixin, SeriesMixin], { types: [schema.Series] }, env)
