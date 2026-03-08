import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface SportsOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
  sport: string | undefined;
  sportTerm: RDF.NamedNode | undefined;
}

export function SportsOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportsOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportsOrganizationClass extends OrganizationMixin(Resource) {
    @rdfine.property.literal()
    sport: string | undefined;
    @rdfine.property({ path: schema.sport })
    sportTerm: RDF.NamedNode | undefined;
  }
  return SportsOrganizationClass as any
}
SportsOrganizationMixin.appliesTo = schema.SportsOrganization
SportsOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportsOrganization>([OrganizationMixin, SportsOrganizationMixin], { types: [schema.SportsOrganization] }, env)
