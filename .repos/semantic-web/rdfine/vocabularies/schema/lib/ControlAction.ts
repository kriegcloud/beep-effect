import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface ControlAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function ControlActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ControlAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ControlActionClass extends ActionMixin(Resource) {
  }
  return ControlActionClass as any
}
ControlActionMixin.appliesTo = schema.ControlAction
ControlActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ControlAction>([ActionMixin, ControlActionMixin], { types: [schema.ControlAction] }, env)
