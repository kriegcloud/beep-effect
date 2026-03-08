import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface ComedyClub<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function ComedyClubMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComedyClub & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComedyClubClass extends EntertainmentBusinessMixin(Resource) {
  }
  return ComedyClubClass as any
}
ComedyClubMixin.appliesTo = schema.ComedyClub
ComedyClubMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComedyClub>([EntertainmentBusinessMixin, ComedyClubMixin], { types: [schema.ComedyClub] }, env)
