import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface SolveMathAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  eduQuestionType: string | undefined;
}

export function SolveMathActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SolveMathAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SolveMathActionClass extends ActionMixin(Resource) {
    @rdfine.property.literal()
    eduQuestionType: string | undefined;
  }
  return SolveMathActionClass as any
}
SolveMathActionMixin.appliesTo = schema.SolveMathAction
SolveMathActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SolveMathAction>([ActionMixin, SolveMathActionMixin], { types: [schema.SolveMathAction] }, env)
