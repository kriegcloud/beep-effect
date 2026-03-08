import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface HealthPlanFormulary<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  healthPlanCostSharing: boolean | undefined;
  healthPlanDrugTier: string | undefined;
  offersPrescriptionByMail: boolean | undefined;
}

export function HealthPlanFormularyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HealthPlanFormulary & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HealthPlanFormularyClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    healthPlanCostSharing: boolean | undefined;
    @rdfine.property.literal()
    healthPlanDrugTier: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    offersPrescriptionByMail: boolean | undefined;
  }
  return HealthPlanFormularyClass as any
}
HealthPlanFormularyMixin.appliesTo = schema.HealthPlanFormulary
HealthPlanFormularyMixin.createFactory = (env: RdfineEnvironment) => createFactory<HealthPlanFormulary>([IntangibleMixin, HealthPlanFormularyMixin], { types: [schema.HealthPlanFormulary] }, env)
