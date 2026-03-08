import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';
import { SeriesMixin } from './Series.js';

export interface EventSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, Schema.Series<D>, rdfine.RdfResource<D> {
}

export function EventSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EventSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EventSeriesClass extends SeriesMixin(EventMixin(Resource)) {
  }
  return EventSeriesClass as any
}
EventSeriesMixin.appliesTo = schema.EventSeries
EventSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<EventSeries>([SeriesMixin, EventMixin, EventSeriesMixin], { types: [schema.EventSeries] }, env)
