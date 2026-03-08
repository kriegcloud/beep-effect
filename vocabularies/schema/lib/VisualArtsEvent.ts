import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface VisualArtsEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function VisualArtsEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VisualArtsEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VisualArtsEventClass extends EventMixin(Resource) {
  }
  return VisualArtsEventClass as any
}
VisualArtsEventMixin.appliesTo = schema.VisualArtsEvent
VisualArtsEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<VisualArtsEvent>([EventMixin, VisualArtsEventMixin], { types: [schema.VisualArtsEvent] }, env)
