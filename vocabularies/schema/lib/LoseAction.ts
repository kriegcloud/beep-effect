import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AchieveActionMixin } from './AchieveAction.js';

export interface LoseAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AchieveAction<D>, rdfine.RdfResource<D> {
  winner: Schema.Person<D> | undefined;
}

export function LoseActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LoseAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LoseActionClass extends AchieveActionMixin(Resource) {
    @rdfine.property.resource()
    winner: Schema.Person | undefined;
  }
  return LoseActionClass as any
}
LoseActionMixin.appliesTo = schema.LoseAction
LoseActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<LoseAction>([AchieveActionMixin, LoseActionMixin], { types: [schema.LoseAction] }, env)
