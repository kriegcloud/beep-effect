import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';
import { SubstanceMixin } from './Substance.js';

export interface Drug<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, Schema.Substance<D>, rdfine.RdfResource<D> {
  activeIngredient: string | undefined;
  administrationRoute: string | undefined;
  alcoholWarning: string | undefined;
  availableStrength: Schema.DrugStrength<D> | undefined;
  breastfeedingWarning: string | undefined;
  clincalPharmacology: string | undefined;
  clinicalPharmacology: string | undefined;
  dosageForm: string | undefined;
  doseSchedule: Schema.DoseSchedule<D> | undefined;
  drugClass: Schema.DrugClass<D> | undefined;
  drugUnit: string | undefined;
  foodWarning: string | undefined;
  includedInHealthInsurancePlan: Schema.HealthInsurancePlan<D> | undefined;
  interactingDrug: Schema.Drug<D> | undefined;
  isAvailableGenerically: boolean | undefined;
  isProprietary: boolean | undefined;
  labelDetails: RDF.NamedNode | undefined;
  legalStatus: Schema.DrugLegalStatus<D> | undefined;
  legalStatusLiteral: string | undefined;
  maximumIntake: Schema.MaximumDoseSchedule<D> | undefined;
  mechanismOfAction: string | undefined;
  nonProprietaryName: string | undefined;
  overdosage: string | undefined;
  pregnancyCategory: Schema.DrugPregnancyCategory | undefined;
  pregnancyWarning: string | undefined;
  prescribingInfo: RDF.NamedNode | undefined;
  prescriptionStatus: string | undefined;
  prescriptionStatusTerm: Schema.DrugPrescriptionStatus | undefined;
  proprietaryName: string | undefined;
  relatedDrug: Schema.Drug<D> | undefined;
  rxcui: string | undefined;
  warning: string | undefined;
  warningTerm: RDF.NamedNode | undefined;
}

export function DrugMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Drug & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrugClass extends SubstanceMixin(ProductMixin(Resource)) {
    @rdfine.property.literal()
    activeIngredient: string | undefined;
    @rdfine.property.literal()
    administrationRoute: string | undefined;
    @rdfine.property.literal()
    alcoholWarning: string | undefined;
    @rdfine.property.resource()
    availableStrength: Schema.DrugStrength | undefined;
    @rdfine.property.literal()
    breastfeedingWarning: string | undefined;
    @rdfine.property.literal()
    clincalPharmacology: string | undefined;
    @rdfine.property.literal()
    clinicalPharmacology: string | undefined;
    @rdfine.property.literal()
    dosageForm: string | undefined;
    @rdfine.property.resource()
    doseSchedule: Schema.DoseSchedule | undefined;
    @rdfine.property.resource()
    drugClass: Schema.DrugClass | undefined;
    @rdfine.property.literal()
    drugUnit: string | undefined;
    @rdfine.property.literal()
    foodWarning: string | undefined;
    @rdfine.property.resource()
    includedInHealthInsurancePlan: Schema.HealthInsurancePlan | undefined;
    @rdfine.property.resource()
    interactingDrug: Schema.Drug | undefined;
    @rdfine.property.literal({ type: Boolean })
    isAvailableGenerically: boolean | undefined;
    @rdfine.property.literal({ type: Boolean })
    isProprietary: boolean | undefined;
    @rdfine.property()
    labelDetails: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    legalStatus: Schema.DrugLegalStatus | undefined;
    @rdfine.property.literal({ path: schema.legalStatus })
    legalStatusLiteral: string | undefined;
    @rdfine.property.resource()
    maximumIntake: Schema.MaximumDoseSchedule | undefined;
    @rdfine.property.literal()
    mechanismOfAction: string | undefined;
    @rdfine.property.literal()
    nonProprietaryName: string | undefined;
    @rdfine.property.literal()
    overdosage: string | undefined;
    @rdfine.property()
    pregnancyCategory: Schema.DrugPregnancyCategory | undefined;
    @rdfine.property.literal()
    pregnancyWarning: string | undefined;
    @rdfine.property()
    prescribingInfo: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    prescriptionStatus: string | undefined;
    @rdfine.property({ path: schema.prescriptionStatus })
    prescriptionStatusTerm: Schema.DrugPrescriptionStatus | undefined;
    @rdfine.property.literal()
    proprietaryName: string | undefined;
    @rdfine.property.resource()
    relatedDrug: Schema.Drug | undefined;
    @rdfine.property.literal()
    rxcui: string | undefined;
    @rdfine.property.literal()
    warning: string | undefined;
    @rdfine.property({ path: schema.warning })
    warningTerm: RDF.NamedNode | undefined;
  }
  return DrugClass as any
}
DrugMixin.appliesTo = schema.Drug
DrugMixin.createFactory = (env: RdfineEnvironment) => createFactory<Drug>([SubstanceMixin, ProductMixin, DrugMixin], { types: [schema.Drug] }, env)
