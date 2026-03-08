import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface ExhibitionEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function ExhibitionEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExhibitionEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ExhibitionEventClass extends EventMixin(Resource) {
  }
  return ExhibitionEventClass as any
}
ExhibitionEventMixin.appliesTo = schema.ExhibitionEvent
ExhibitionEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExhibitionEvent>([EventMixin, ExhibitionEventMixin], { types: [schema.ExhibitionEvent] }, env)
