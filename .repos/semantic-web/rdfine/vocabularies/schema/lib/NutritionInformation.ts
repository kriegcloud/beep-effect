import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface NutritionInformation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  calories: Schema.Energy<D> | undefined;
  carbohydrateContent: Schema.Mass<D> | undefined;
  cholesterolContent: Schema.Mass<D> | undefined;
  fatContent: Schema.Mass<D> | undefined;
  fiberContent: Schema.Mass<D> | undefined;
  proteinContent: Schema.Mass<D> | undefined;
  saturatedFatContent: Schema.Mass<D> | undefined;
  servingSize: string | undefined;
  sodiumContent: Schema.Mass<D> | undefined;
  sugarContent: Schema.Mass<D> | undefined;
  transFatContent: Schema.Mass<D> | undefined;
  unsaturatedFatContent: Schema.Mass<D> | undefined;
}

export function NutritionInformationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NutritionInformation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NutritionInformationClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    calories: Schema.Energy | undefined;
    @rdfine.property.resource()
    carbohydrateContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    cholesterolContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    fatContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    fiberContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    proteinContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    saturatedFatContent: Schema.Mass | undefined;
    @rdfine.property.literal()
    servingSize: string | undefined;
    @rdfine.property.resource()
    sodiumContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    sugarContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    transFatContent: Schema.Mass | undefined;
    @rdfine.property.resource()
    unsaturatedFatContent: Schema.Mass | undefined;
  }
  return NutritionInformationClass as any
}
NutritionInformationMixin.appliesTo = schema.NutritionInformation
NutritionInformationMixin.createFactory = (env: RdfineEnvironment) => createFactory<NutritionInformation>([StructuredValueMixin, NutritionInformationMixin], { types: [schema.NutritionInformation] }, env)
