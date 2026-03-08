import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface InstallAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function InstallActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InstallAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InstallActionClass extends ConsumeActionMixin(Resource) {
  }
  return InstallActionClass as any
}
InstallActionMixin.appliesTo = schema.InstallAction
InstallActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<InstallAction>([ConsumeActionMixin, InstallActionMixin], { types: [schema.InstallAction] }, env)
