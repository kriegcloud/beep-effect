import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface NightClub<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function NightClubMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NightClub & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NightClubClass extends EntertainmentBusinessMixin(Resource) {
  }
  return NightClubClass as any
}
NightClubMixin.appliesTo = schema.NightClub
NightClubMixin.createFactory = (env: RdfineEnvironment) => createFactory<NightClub>([EntertainmentBusinessMixin, NightClubMixin], { types: [schema.NightClub] }, env)
