import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommentMixin } from './Comment.js';

export interface CorrectionComment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Comment<D>, rdfine.RdfResource<D> {
}

export function CorrectionCommentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CorrectionComment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CorrectionCommentClass extends CommentMixin(Resource) {
  }
  return CorrectionCommentClass as any
}
CorrectionCommentMixin.appliesTo = schema.CorrectionComment
CorrectionCommentMixin.createFactory = (env: RdfineEnvironment) => createFactory<CorrectionComment>([CommentMixin, CorrectionCommentMixin], { types: [schema.CorrectionComment] }, env)
