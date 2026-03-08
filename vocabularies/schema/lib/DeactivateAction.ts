import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ControlActionMixin } from './ControlAction.js';

export interface DeactivateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ControlAction<D>, rdfine.RdfResource<D> {
}

export function DeactivateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeactivateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DeactivateActionClass extends ControlActionMixin(Resource) {
  }
  return DeactivateActionClass as any
}
DeactivateActionMixin.appliesTo = schema.DeactivateAction
DeactivateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeactivateAction>([ControlActionMixin, DeactivateActionMixin], { types: [schema.DeactivateAction] }, env)
