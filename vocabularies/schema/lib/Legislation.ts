import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Legislation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  jurisdiction: Schema.AdministrativeArea<D> | undefined;
  jurisdictionLiteral: string | undefined;
  legislationApplies: Schema.Legislation<D> | undefined;
  legislationChanges: Schema.Legislation<D> | undefined;
  legislationConsolidates: Schema.Legislation<D> | undefined;
  legislationDate: Date | undefined;
  legislationDateVersion: Date | undefined;
  legislationIdentifier: string | undefined;
  legislationIdentifierTerm: RDF.NamedNode | undefined;
  legislationJurisdiction: Schema.AdministrativeArea<D> | undefined;
  legislationJurisdictionLiteral: string | undefined;
  legislationLegalForce: Schema.LegalForceStatus | undefined;
  legislationPassedBy: Schema.Organization<D> | Schema.Person<D> | undefined;
  legislationResponsible: Schema.Organization<D> | Schema.Person<D> | undefined;
  legislationTransposes: Schema.Legislation<D> | undefined;
  legislationType: Schema.CategoryCode<D> | undefined;
  legislationTypeLiteral: string | undefined;
}

export function LegislationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Legislation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LegislationClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    jurisdiction: Schema.AdministrativeArea | undefined;
    @rdfine.property.literal({ path: schema.jurisdiction })
    jurisdictionLiteral: string | undefined;
    @rdfine.property.resource()
    legislationApplies: Schema.Legislation | undefined;
    @rdfine.property.resource()
    legislationChanges: Schema.Legislation | undefined;
    @rdfine.property.resource()
    legislationConsolidates: Schema.Legislation | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    legislationDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    legislationDateVersion: Date | undefined;
    @rdfine.property.literal()
    legislationIdentifier: string | undefined;
    @rdfine.property({ path: schema.legislationIdentifier })
    legislationIdentifierTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    legislationJurisdiction: Schema.AdministrativeArea | undefined;
    @rdfine.property.literal({ path: schema.legislationJurisdiction })
    legislationJurisdictionLiteral: string | undefined;
    @rdfine.property()
    legislationLegalForce: Schema.LegalForceStatus | undefined;
    @rdfine.property.resource()
    legislationPassedBy: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    legislationResponsible: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    legislationTransposes: Schema.Legislation | undefined;
    @rdfine.property.resource()
    legislationType: Schema.CategoryCode | undefined;
    @rdfine.property.literal({ path: schema.legislationType })
    legislationTypeLiteral: string | undefined;
  }
  return LegislationClass as any
}
LegislationMixin.appliesTo = schema.Legislation
LegislationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Legislation>([CreativeWorkMixin, LegislationMixin], { types: [schema.Legislation] }, env)
