import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface StadiumOrArena<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function StadiumOrArenaMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<StadiumOrArena & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class StadiumOrArenaClass extends SportsActivityLocationMixin(CivicStructureMixin(Resource)) {
  }
  return StadiumOrArenaClass as any
}
StadiumOrArenaMixin.appliesTo = schema.StadiumOrArena
StadiumOrArenaMixin.createFactory = (env: RdfineEnvironment) => createFactory<StadiumOrArena>([SportsActivityLocationMixin, CivicStructureMixin, StadiumOrArenaMixin], { types: [schema.StadiumOrArena] }, env)
