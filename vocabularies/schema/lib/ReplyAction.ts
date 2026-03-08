import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface ReplyAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
  resultComment: Schema.Comment<D> | undefined;
}

export function ReplyActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReplyAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReplyActionClass extends CommunicateActionMixin(Resource) {
    @rdfine.property.resource()
    resultComment: Schema.Comment | undefined;
  }
  return ReplyActionClass as any
}
ReplyActionMixin.appliesTo = schema.ReplyAction
ReplyActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReplyAction>([CommunicateActionMixin, ReplyActionMixin], { types: [schema.ReplyAction] }, env)
