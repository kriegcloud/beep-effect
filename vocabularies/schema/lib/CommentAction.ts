import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface CommentAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
  resultComment: Schema.Comment<D> | undefined;
}

export function CommentActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CommentAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CommentActionClass extends CommunicateActionMixin(Resource) {
    @rdfine.property.resource()
    resultComment: Schema.Comment | undefined;
  }
  return CommentActionClass as any
}
CommentActionMixin.appliesTo = schema.CommentAction
CommentActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CommentAction>([CommunicateActionMixin, CommentActionMixin], { types: [schema.CommentAction] }, env)
