import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudienceMixin } from './Audience.js';

export interface PeopleAudience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Audience<D>, rdfine.RdfResource<D> {
  healthCondition: Schema.MedicalCondition<D> | undefined;
  requiredGender: string | undefined;
  requiredMaxAge: number | undefined;
  requiredMinAge: number | undefined;
  suggestedAge: Schema.QuantitativeValue<D> | undefined;
  suggestedGender: string | undefined;
  suggestedGenderTerm: Schema.GenderType | undefined;
  suggestedMaxAge: number | undefined;
  suggestedMeasurement: Schema.QuantitativeValue<D> | undefined;
  suggestedMinAge: number | undefined;
}

export function PeopleAudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PeopleAudience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PeopleAudienceClass extends AudienceMixin(Resource) {
    @rdfine.property.resource()
    healthCondition: Schema.MedicalCondition | undefined;
    @rdfine.property.literal()
    requiredGender: string | undefined;
    @rdfine.property.literal({ type: Number })
    requiredMaxAge: number | undefined;
    @rdfine.property.literal({ type: Number })
    requiredMinAge: number | undefined;
    @rdfine.property.resource()
    suggestedAge: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    suggestedGender: string | undefined;
    @rdfine.property({ path: schema.suggestedGender })
    suggestedGenderTerm: Schema.GenderType | undefined;
    @rdfine.property.literal({ type: Number })
    suggestedMaxAge: number | undefined;
    @rdfine.property.resource()
    suggestedMeasurement: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Number })
    suggestedMinAge: number | undefined;
  }
  return PeopleAudienceClass as any
}
PeopleAudienceMixin.appliesTo = schema.PeopleAudience
PeopleAudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<PeopleAudience>([AudienceMixin, PeopleAudienceMixin], { types: [schema.PeopleAudience] }, env)
