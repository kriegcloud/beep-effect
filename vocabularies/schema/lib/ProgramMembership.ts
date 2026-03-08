import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ProgramMembership<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  hostingOrganization: Schema.Organization<D> | undefined;
  member: Schema.Organization<D> | Schema.Person<D> | undefined;
  members: Schema.Organization<D> | Schema.Person<D> | undefined;
  membershipNumber: string | undefined;
  membershipPointsEarned: Schema.QuantitativeValue<D> | undefined;
  membershipPointsEarnedLiteral: number | undefined;
  programName: string | undefined;
}

export function ProgramMembershipMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProgramMembership & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProgramMembershipClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    hostingOrganization: Schema.Organization | undefined;
    @rdfine.property.resource()
    member: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    members: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    membershipNumber: string | undefined;
    @rdfine.property.resource()
    membershipPointsEarned: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.membershipPointsEarned, type: Number })
    membershipPointsEarnedLiteral: number | undefined;
    @rdfine.property.literal()
    programName: string | undefined;
  }
  return ProgramMembershipClass as any
}
ProgramMembershipMixin.appliesTo = schema.ProgramMembership
ProgramMembershipMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProgramMembership>([IntangibleMixin, ProgramMembershipMixin], { types: [schema.ProgramMembership] }, env)
