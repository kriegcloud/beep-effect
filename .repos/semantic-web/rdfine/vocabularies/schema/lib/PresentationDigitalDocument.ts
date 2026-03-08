import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { DigitalDocumentMixin } from './DigitalDocument.js';

export interface PresentationDigitalDocument<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.DigitalDocument<D>, rdfine.RdfResource<D> {
}

export function PresentationDigitalDocumentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PresentationDigitalDocument & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PresentationDigitalDocumentClass extends DigitalDocumentMixin(Resource) {
  }
  return PresentationDigitalDocumentClass as any
}
PresentationDigitalDocumentMixin.appliesTo = schema.PresentationDigitalDocument
PresentationDigitalDocumentMixin.createFactory = (env: RdfineEnvironment) => createFactory<PresentationDigitalDocument>([DigitalDocumentMixin, PresentationDigitalDocumentMixin], { types: [schema.PresentationDigitalDocument] }, env)
