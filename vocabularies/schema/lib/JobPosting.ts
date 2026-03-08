import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface JobPosting<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  applicantLocationRequirements: Schema.AdministrativeArea<D> | undefined;
  applicationContact: Schema.ContactPoint<D> | undefined;
  baseSalary: Schema.MonetaryAmount<D> | Schema.PriceSpecification<D> | undefined;
  baseSalaryLiteral: number | undefined;
  benefits: string | undefined;
  datePosted: Date | undefined;
  directApply: boolean | undefined;
  educationRequirements: string | undefined;
  eligibilityToWorkRequirement: string | undefined;
  employerOverview: string | undefined;
  employmentType: string | undefined;
  employmentUnit: Schema.Organization<D> | undefined;
  estimatedSalary: Schema.MonetaryAmount<D> | Schema.MonetaryAmountDistribution<D> | undefined;
  estimatedSalaryLiteral: number | undefined;
  experienceInPlaceOfEducation: boolean | undefined;
  experienceRequirements: Schema.OccupationalExperienceRequirements<D> | undefined;
  experienceRequirementsLiteral: string | undefined;
  hiringOrganization: Schema.Organization<D> | Schema.Person<D> | undefined;
  incentiveCompensation: string | undefined;
  incentives: string | undefined;
  industry: string | undefined;
  jobBenefits: string | undefined;
  jobImmediateStart: boolean | undefined;
  jobLocation: Schema.Place<D> | undefined;
  jobLocationType: string | undefined;
  jobStartDate: Date | string | undefined;
  occupationalCategory: Schema.CategoryCode<D> | undefined;
  occupationalCategoryLiteral: string | undefined;
  physicalRequirement: string | undefined;
  physicalRequirementTerm: RDF.NamedNode | undefined;
  qualifications: string | undefined;
  relevantOccupation: Schema.Occupation<D> | undefined;
  responsibilities: string | undefined;
  salaryCurrency: string | undefined;
  securityClearanceRequirement: string | undefined;
  securityClearanceRequirementTerm: RDF.NamedNode | undefined;
  sensoryRequirement: string | undefined;
  sensoryRequirementTerm: RDF.NamedNode | undefined;
  skills: string | undefined;
  specialCommitments: string | undefined;
  title: string | undefined;
  totalJobOpenings: number | undefined;
  validThrough: Date | undefined;
  workHours: string | undefined;
}

export function JobPostingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JobPosting & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class JobPostingClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    applicantLocationRequirements: Schema.AdministrativeArea | undefined;
    @rdfine.property.resource()
    applicationContact: Schema.ContactPoint | undefined;
    @rdfine.property.resource()
    baseSalary: Schema.MonetaryAmount | Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ path: schema.baseSalary, type: Number })
    baseSalaryLiteral: number | undefined;
    @rdfine.property.literal()
    benefits: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    datePosted: Date | undefined;
    @rdfine.property.literal({ type: Boolean })
    directApply: boolean | undefined;
    @rdfine.property.literal()
    educationRequirements: string | undefined;
    @rdfine.property.literal()
    eligibilityToWorkRequirement: string | undefined;
    @rdfine.property.literal()
    employerOverview: string | undefined;
    @rdfine.property.literal()
    employmentType: string | undefined;
    @rdfine.property.resource()
    employmentUnit: Schema.Organization | undefined;
    @rdfine.property.resource()
    estimatedSalary: Schema.MonetaryAmount | Schema.MonetaryAmountDistribution | undefined;
    @rdfine.property.literal({ path: schema.estimatedSalary, type: Number })
    estimatedSalaryLiteral: number | undefined;
    @rdfine.property.literal({ type: Boolean })
    experienceInPlaceOfEducation: boolean | undefined;
    @rdfine.property.resource()
    experienceRequirements: Schema.OccupationalExperienceRequirements | undefined;
    @rdfine.property.literal({ path: schema.experienceRequirements })
    experienceRequirementsLiteral: string | undefined;
    @rdfine.property.resource()
    hiringOrganization: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    incentiveCompensation: string | undefined;
    @rdfine.property.literal()
    incentives: string | undefined;
    @rdfine.property.literal()
    industry: string | undefined;
    @rdfine.property.literal()
    jobBenefits: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    jobImmediateStart: boolean | undefined;
    @rdfine.property.resource()
    jobLocation: Schema.Place | undefined;
    @rdfine.property.literal()
    jobLocationType: string | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    jobStartDate: Date | string | undefined;
    @rdfine.property.resource()
    occupationalCategory: Schema.CategoryCode | undefined;
    @rdfine.property.literal({ path: schema.occupationalCategory })
    occupationalCategoryLiteral: string | undefined;
    @rdfine.property.literal()
    physicalRequirement: string | undefined;
    @rdfine.property({ path: schema.physicalRequirement })
    physicalRequirementTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    qualifications: string | undefined;
    @rdfine.property.resource()
    relevantOccupation: Schema.Occupation | undefined;
    @rdfine.property.literal()
    responsibilities: string | undefined;
    @rdfine.property.literal()
    salaryCurrency: string | undefined;
    @rdfine.property.literal()
    securityClearanceRequirement: string | undefined;
    @rdfine.property({ path: schema.securityClearanceRequirement })
    securityClearanceRequirementTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    sensoryRequirement: string | undefined;
    @rdfine.property({ path: schema.sensoryRequirement })
    sensoryRequirementTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    skills: string | undefined;
    @rdfine.property.literal()
    specialCommitments: string | undefined;
    @rdfine.property.literal()
    title: string | undefined;
    @rdfine.property.literal({ type: Number })
    totalJobOpenings: number | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validThrough: Date | undefined;
    @rdfine.property.literal()
    workHours: string | undefined;
  }
  return JobPostingClass as any
}
JobPostingMixin.appliesTo = schema.JobPosting
JobPostingMixin.createFactory = (env: RdfineEnvironment) => createFactory<JobPosting>([IntangibleMixin, JobPostingMixin], { types: [schema.JobPosting] }, env)
