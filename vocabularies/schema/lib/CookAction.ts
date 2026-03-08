import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface CookAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
  foodEstablishment: Schema.FoodEstablishment<D> | Schema.Place<D> | undefined;
  foodEvent: Schema.FoodEvent<D> | undefined;
  recipe: Schema.Recipe<D> | undefined;
}

export function CookActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CookAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CookActionClass extends CreateActionMixin(Resource) {
    @rdfine.property.resource()
    foodEstablishment: Schema.FoodEstablishment | Schema.Place | undefined;
    @rdfine.property.resource()
    foodEvent: Schema.FoodEvent | undefined;
    @rdfine.property.resource()
    recipe: Schema.Recipe | undefined;
  }
  return CookActionClass as any
}
CookActionMixin.appliesTo = schema.CookAction
CookActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CookAction>([CreateActionMixin, CookActionMixin], { types: [schema.CookAction] }, env)
