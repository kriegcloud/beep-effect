import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface AskAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
  question: Schema.Question<D> | undefined;
}

export function AskActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AskAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AskActionClass extends CommunicateActionMixin(Resource) {
    @rdfine.property.resource()
    question: Schema.Question | undefined;
  }
  return AskActionClass as any
}
AskActionMixin.appliesTo = schema.AskAction
AskActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AskAction>([CommunicateActionMixin, AskActionMixin], { types: [schema.AskAction] }, env)
