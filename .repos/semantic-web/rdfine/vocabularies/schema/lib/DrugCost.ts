import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface DrugCost<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  applicableLocation: Schema.AdministrativeArea<D> | undefined;
  costCategory: Schema.DrugCostCategory | undefined;
  costCurrency: string | undefined;
  costOrigin: string | undefined;
  costPerUnit: number | string | undefined;
  costPerUnitTerm: Schema.QualitativeValue | undefined;
  drugUnit: string | undefined;
}

export function DrugCostMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DrugCost & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrugCostClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    applicableLocation: Schema.AdministrativeArea | undefined;
    @rdfine.property()
    costCategory: Schema.DrugCostCategory | undefined;
    @rdfine.property.literal()
    costCurrency: string | undefined;
    @rdfine.property.literal()
    costOrigin: string | undefined;
    @rdfine.property.literal()
    costPerUnit: number | string | undefined;
    @rdfine.property({ path: schema.costPerUnit })
    costPerUnitTerm: Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    drugUnit: string | undefined;
  }
  return DrugCostClass as any
}
DrugCostMixin.appliesTo = schema.DrugCost
DrugCostMixin.createFactory = (env: RdfineEnvironment) => createFactory<DrugCost>([MedicalEntityMixin, DrugCostMixin], { types: [schema.DrugCost] }, env)
