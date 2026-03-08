import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { DocumentMixin } from './Document.js';

export interface PersonalProfileDocument<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Document<D>, rdfine.RdfResource<D> {
}

export function PersonalProfileDocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PersonalProfileDocument & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class PersonalProfileDocumentClass extends DocumentMixin(Resource) {
  }
  return PersonalProfileDocumentClass as any
}
PersonalProfileDocumentMixin.appliesTo = foaf.PersonalProfileDocument
PersonalProfileDocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<PersonalProfileDocument>([DocumentMixin, PersonalProfileDocumentMixin], { types: [foaf.PersonalProfileDocument] }, env)
