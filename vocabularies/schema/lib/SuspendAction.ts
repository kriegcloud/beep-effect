import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ControlActionMixin } from './ControlAction.js';

export interface SuspendAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ControlAction<D>, rdfine.RdfResource<D> {
}

export function SuspendActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SuspendAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SuspendActionClass extends ControlActionMixin(Resource) {
  }
  return SuspendActionClass as any
}
SuspendActionMixin.appliesTo = schema.SuspendAction
SuspendActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SuspendAction>([ControlActionMixin, SuspendActionMixin], { types: [schema.SuspendAction] }, env)
