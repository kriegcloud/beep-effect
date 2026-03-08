import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ControlActionMixin } from './ControlAction.js';

export interface ResumeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ControlAction<D>, rdfine.RdfResource<D> {
}

export function ResumeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResumeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResumeActionClass extends ControlActionMixin(Resource) {
  }
  return ResumeActionClass as any
}
ResumeActionMixin.appliesTo = schema.ResumeAction
ResumeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResumeAction>([ControlActionMixin, ResumeActionMixin], { types: [schema.ResumeAction] }, env)
