import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface SportsClub<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function SportsClubMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportsClub & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportsClubClass extends SportsActivityLocationMixin(Resource) {
  }
  return SportsClubClass as any
}
SportsClubMixin.appliesTo = schema.SportsClub
SportsClubMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportsClub>([SportsActivityLocationMixin, SportsClubMixin], { types: [schema.SportsClub] }, env)
