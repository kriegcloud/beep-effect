import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface DrinkAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function DrinkActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DrinkAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrinkActionClass extends ConsumeActionMixin(Resource) {
  }
  return DrinkActionClass as any
}
DrinkActionMixin.appliesTo = schema.DrinkAction
DrinkActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DrinkAction>([ConsumeActionMixin, DrinkActionMixin], { types: [schema.DrinkAction] }, env)
