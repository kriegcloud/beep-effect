import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';

export interface Document<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  primaryTopic: RDF.NamedNode | undefined;
  'sha1': RDF.Term | undefined;
  topic: RDF.NamedNode | undefined;
}

export function DocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Document & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class DocumentClass extends Resource {
    @rdfine.property()
    primaryTopic: RDF.NamedNode | undefined;
    @rdfine.property()
    'sha1': RDF.Term | undefined;
    @rdfine.property()
    topic: RDF.NamedNode | undefined;
  }
  return DocumentClass as any
}
DocumentMixin.appliesTo = foaf.Document
DocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Document>([DocumentMixin], { types: [foaf.Document] }, env)
