import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface EducationalOccupationalProgram<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  applicationDeadline: Date | undefined;
  applicationStartDate: Date | undefined;
  dayOfWeek: Schema.DayOfWeek | undefined;
  educationalCredentialAwarded: string | undefined;
  educationalCredentialAwardedTerm: RDF.NamedNode | undefined;
  educationalProgramMode: string | undefined;
  educationalProgramModeTerm: RDF.NamedNode | undefined;
  endDate: Date | undefined;
  financialAidEligible: string | undefined;
  hasCourse: Schema.Course<D> | undefined;
  maximumEnrollment: number | undefined;
  numberOfCredits: Schema.StructuredValue<D> | undefined;
  numberOfCreditsLiteral: number | undefined;
  occupationalCategory: Schema.CategoryCode<D> | undefined;
  occupationalCategoryLiteral: string | undefined;
  occupationalCredentialAwarded: string | undefined;
  occupationalCredentialAwardedTerm: RDF.NamedNode | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  programPrerequisites: Schema.AlignmentObject<D> | Schema.Course<D> | undefined;
  programPrerequisitesLiteral: string | undefined;
  programType: string | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  salaryUponCompletion: Schema.MonetaryAmountDistribution<D> | undefined;
  startDate: Date | undefined;
  termDuration: Schema.Duration<D> | undefined;
  termsPerYear: number | undefined;
  timeOfDay: string | undefined;
  timeToComplete: Schema.Duration<D> | undefined;
  trainingSalary: Schema.MonetaryAmountDistribution<D> | undefined;
  typicalCreditsPerTerm: Schema.StructuredValue<D> | undefined;
  typicalCreditsPerTermLiteral: number | undefined;
}

export function EducationalOccupationalProgramMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EducationalOccupationalProgram & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EducationalOccupationalProgramClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    applicationDeadline: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    applicationStartDate: Date | undefined;
    @rdfine.property()
    dayOfWeek: Schema.DayOfWeek | undefined;
    @rdfine.property.literal()
    educationalCredentialAwarded: string | undefined;
    @rdfine.property({ path: schema.educationalCredentialAwarded })
    educationalCredentialAwardedTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    educationalProgramMode: string | undefined;
    @rdfine.property({ path: schema.educationalProgramMode })
    educationalProgramModeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.literal()
    financialAidEligible: string | undefined;
    @rdfine.property.resource()
    hasCourse: Schema.Course | undefined;
    @rdfine.property.literal({ type: Number })
    maximumEnrollment: number | undefined;
    @rdfine.property.resource()
    numberOfCredits: Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfCredits, type: Number })
    numberOfCreditsLiteral: number | undefined;
    @rdfine.property.resource()
    occupationalCategory: Schema.CategoryCode | undefined;
    @rdfine.property.literal({ path: schema.occupationalCategory })
    occupationalCategoryLiteral: string | undefined;
    @rdfine.property.literal()
    occupationalCredentialAwarded: string | undefined;
    @rdfine.property({ path: schema.occupationalCredentialAwarded })
    occupationalCredentialAwardedTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.resource()
    programPrerequisites: Schema.AlignmentObject | Schema.Course | undefined;
    @rdfine.property.literal({ path: schema.programPrerequisites })
    programPrerequisitesLiteral: string | undefined;
    @rdfine.property.literal()
    programType: string | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    salaryUponCompletion: Schema.MonetaryAmountDistribution | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
    @rdfine.property.resource()
    termDuration: Schema.Duration | undefined;
    @rdfine.property.literal({ type: Number })
    termsPerYear: number | undefined;
    @rdfine.property.literal()
    timeOfDay: string | undefined;
    @rdfine.property.resource()
    timeToComplete: Schema.Duration | undefined;
    @rdfine.property.resource()
    trainingSalary: Schema.MonetaryAmountDistribution | undefined;
    @rdfine.property.resource()
    typicalCreditsPerTerm: Schema.StructuredValue | undefined;
    @rdfine.property.literal({ path: schema.typicalCreditsPerTerm, type: Number })
    typicalCreditsPerTermLiteral: number | undefined;
  }
  return EducationalOccupationalProgramClass as any
}
EducationalOccupationalProgramMixin.appliesTo = schema.EducationalOccupationalProgram
EducationalOccupationalProgramMixin.createFactory = (env: RdfineEnvironment) => createFactory<EducationalOccupationalProgram>([IntangibleMixin, EducationalOccupationalProgramMixin], { types: [schema.EducationalOccupationalProgram] }, env)
