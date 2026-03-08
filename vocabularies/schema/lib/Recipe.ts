import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HowToMixin } from './HowTo.js';

export interface Recipe<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HowTo<D>, rdfine.RdfResource<D> {
  cookingMethod: string | undefined;
  cookTime: Schema.Duration<D> | undefined;
  ingredients: string | undefined;
  nutrition: Schema.NutritionInformation<D> | undefined;
  recipeCategory: string | undefined;
  recipeCuisine: string | undefined;
  recipeIngredient: string | undefined;
  recipeInstructions: Schema.CreativeWork<D> | Schema.ItemList<D> | undefined;
  recipeInstructionsLiteral: string | undefined;
  recipeYield: Schema.QuantitativeValue<D> | undefined;
  recipeYieldLiteral: string | undefined;
  suitableForDiet: Schema.RestrictedDiet | undefined;
}

export function RecipeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Recipe & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RecipeClass extends HowToMixin(Resource) {
    @rdfine.property.literal()
    cookingMethod: string | undefined;
    @rdfine.property.resource()
    cookTime: Schema.Duration | undefined;
    @rdfine.property.literal()
    ingredients: string | undefined;
    @rdfine.property.resource()
    nutrition: Schema.NutritionInformation | undefined;
    @rdfine.property.literal()
    recipeCategory: string | undefined;
    @rdfine.property.literal()
    recipeCuisine: string | undefined;
    @rdfine.property.literal()
    recipeIngredient: string | undefined;
    @rdfine.property.resource()
    recipeInstructions: Schema.CreativeWork | Schema.ItemList | undefined;
    @rdfine.property.literal({ path: schema.recipeInstructions })
    recipeInstructionsLiteral: string | undefined;
    @rdfine.property.resource()
    recipeYield: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.recipeYield })
    recipeYieldLiteral: string | undefined;
    @rdfine.property()
    suitableForDiet: Schema.RestrictedDiet | undefined;
  }
  return RecipeClass as any
}
RecipeMixin.appliesTo = schema.Recipe
RecipeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Recipe>([HowToMixin, RecipeMixin], { types: [schema.Recipe] }, env)
