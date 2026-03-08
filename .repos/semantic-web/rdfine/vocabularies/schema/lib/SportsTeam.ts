import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SportsOrganizationMixin } from './SportsOrganization.js';

export interface SportsTeam<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SportsOrganization<D>, rdfine.RdfResource<D> {
  athlete: Schema.Person<D> | undefined;
  coach: Schema.Person<D> | undefined;
  gender: string | undefined;
  genderTerm: Schema.GenderType | undefined;
}

export function SportsTeamMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportsTeam & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportsTeamClass extends SportsOrganizationMixin(Resource) {
    @rdfine.property.resource()
    athlete: Schema.Person | undefined;
    @rdfine.property.resource()
    coach: Schema.Person | undefined;
    @rdfine.property.literal()
    gender: string | undefined;
    @rdfine.property({ path: schema.gender })
    genderTerm: Schema.GenderType | undefined;
  }
  return SportsTeamClass as any
}
SportsTeamMixin.appliesTo = schema.SportsTeam
SportsTeamMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportsTeam>([SportsOrganizationMixin, SportsTeamMixin], { types: [schema.SportsTeam] }, env)
