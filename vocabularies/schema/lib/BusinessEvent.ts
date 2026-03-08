import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface BusinessEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function BusinessEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusinessEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusinessEventClass extends EventMixin(Resource) {
  }
  return BusinessEventClass as any
}
BusinessEventMixin.appliesTo = schema.BusinessEvent
BusinessEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusinessEvent>([EventMixin, BusinessEventMixin], { types: [schema.BusinessEvent] }, env)
