import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface ScreeningEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  subtitleLanguage: Schema.Language<D> | undefined;
  subtitleLanguageLiteral: string | undefined;
  videoFormat: string | undefined;
  workPresented: Schema.Movie<D> | undefined;
}

export function ScreeningEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScreeningEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ScreeningEventClass extends EventMixin(Resource) {
    @rdfine.property.resource()
    subtitleLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.subtitleLanguage })
    subtitleLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    videoFormat: string | undefined;
    @rdfine.property.resource()
    workPresented: Schema.Movie | undefined;
  }
  return ScreeningEventClass as any
}
ScreeningEventMixin.appliesTo = schema.ScreeningEvent
ScreeningEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScreeningEvent>([EventMixin, ScreeningEventMixin], { types: [schema.ScreeningEvent] }, env)
