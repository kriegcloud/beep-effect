import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface HealthClub<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function HealthClubMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HealthClub & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HealthClubClass extends SportsActivityLocationMixin(HealthAndBeautyBusinessMixin(Resource)) {
  }
  return HealthClubClass as any
}
HealthClubMixin.appliesTo = schema.HealthClub
HealthClubMixin.createFactory = (env: RdfineEnvironment) => createFactory<HealthClub>([SportsActivityLocationMixin, HealthAndBeautyBusinessMixin, HealthClubMixin], { types: [schema.HealthClub] }, env)
