import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ControlActionMixin } from './ControlAction.js';

export interface ActivateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ControlAction<D>, rdfine.RdfResource<D> {
}

export function ActivateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ActivateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ActivateActionClass extends ControlActionMixin(Resource) {
  }
  return ActivateActionClass as any
}
ActivateActionMixin.appliesTo = schema.ActivateAction
ActivateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ActivateAction>([ControlActionMixin, ActivateActionMixin], { types: [schema.ActivateAction] }, env)
