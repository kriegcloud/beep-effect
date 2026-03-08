import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface ComedyEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function ComedyEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComedyEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComedyEventClass extends EventMixin(Resource) {
  }
  return ComedyEventClass as any
}
ComedyEventMixin.appliesTo = schema.ComedyEvent
ComedyEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComedyEvent>([EventMixin, ComedyEventMixin], { types: [schema.ComedyEvent] }, env)
