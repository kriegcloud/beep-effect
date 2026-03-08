import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface SaleEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
}

export function SaleEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SaleEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SaleEventClass extends EventMixin(Resource) {
  }
  return SaleEventClass as any
}
SaleEventMixin.appliesTo = schema.SaleEvent
SaleEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<SaleEvent>([EventMixin, SaleEventMixin], { types: [schema.SaleEvent] }, env)
