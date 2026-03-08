import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface EventVenue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function EventVenueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EventVenue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EventVenueClass extends CivicStructureMixin(Resource) {
  }
  return EventVenueClass as any
}
EventVenueMixin.appliesTo = schema.EventVenue
EventVenueMixin.createFactory = (env: RdfineEnvironment) => createFactory<EventVenue>([CivicStructureMixin, EventVenueMixin], { types: [schema.EventVenue] }, env)
