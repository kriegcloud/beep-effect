import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface MusicVenue<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function MusicVenueMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicVenue & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicVenueClass extends CivicStructureMixin(Resource) {
  }
  return MusicVenueClass as any
}
MusicVenueMixin.appliesTo = schema.MusicVenue
MusicVenueMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicVenue>([CivicStructureMixin, MusicVenueMixin], { types: [schema.MusicVenue] }, env)
