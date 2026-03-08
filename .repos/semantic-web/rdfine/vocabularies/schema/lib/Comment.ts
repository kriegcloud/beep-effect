import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Comment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  downvoteCount: number | undefined;
  parentItem: Schema.Comment<D> | undefined;
  upvoteCount: number | undefined;
}

export function CommentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Comment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CommentClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    downvoteCount: number | undefined;
    @rdfine.property.resource()
    parentItem: Schema.Comment | undefined;
    @rdfine.property.literal({ type: Number })
    upvoteCount: number | undefined;
  }
  return CommentClass as any
}
CommentMixin.appliesTo = schema.Comment
CommentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Comment>([CreativeWorkMixin, CommentMixin], { types: [schema.Comment] }, env)
