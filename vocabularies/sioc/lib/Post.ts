import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sioc } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sioc from '../index.js';
import type * as Foaf from '@rdfine/foaf';
import { DocumentMixin as FoafDocumentMixin } from '@rdfine/foaf/lib/Document';
import { ItemMixin } from './Item.js';

export interface Post<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Document<D>, Sioc.Item<D>, rdfine.RdfResource<D> {
  'content_encoded': RDF.Literal | undefined;
  'created_at': RDF.Literal | undefined;
  description: RDF.Literal | undefined;
  'modified_at': RDF.Literal | undefined;
  reference: RDF.Term | undefined;
  subject: RDF.Literal | undefined;
  title: RDF.Literal | undefined;
}

export function PostMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Post & RdfResourceCore> & Base {
  @rdfine.namespace(sioc)
  class PostClass extends ItemMixin(FoafDocumentMixin(Resource)) {
    @rdfine.property()
    'content_encoded': RDF.Literal | undefined;
    @rdfine.property()
    'created_at': RDF.Literal | undefined;
    @rdfine.property()
    description: RDF.Literal | undefined;
    @rdfine.property()
    'modified_at': RDF.Literal | undefined;
    @rdfine.property()
    reference: RDF.Term | undefined;
    @rdfine.property()
    subject: RDF.Literal | undefined;
    @rdfine.property()
    title: RDF.Literal | undefined;
  }
  return PostClass as any
}
PostMixin.appliesTo = sioc.Post
PostMixin.createFactory = (env: RdfineEnvironment) => createFactory<Post>([ItemMixin, FoafDocumentMixin, PostMixin], { types: [sioc.Post] }, env)
