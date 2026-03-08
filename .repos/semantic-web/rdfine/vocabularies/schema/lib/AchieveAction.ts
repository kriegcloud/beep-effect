import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface AchieveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function AchieveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AchieveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AchieveActionClass extends ActionMixin(Resource) {
  }
  return AchieveActionClass as any
}
AchieveActionMixin.appliesTo = schema.AchieveAction
AchieveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AchieveAction>([ActionMixin, AchieveActionMixin], { types: [schema.AchieveAction] }, env)
