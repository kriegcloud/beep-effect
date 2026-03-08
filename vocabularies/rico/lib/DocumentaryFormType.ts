import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface DocumentaryFormType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isDocumentaryFormTypeOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasDocumentaryFormTypeOfAllMembersOf: Rico.RecordSet<D> | undefined;
  isOrWasDocumentaryFormTypeOfSomeMembersOf: Rico.RecordSet<D> | undefined;
}

export function DocumentaryFormTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DocumentaryFormType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class DocumentaryFormTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource()
    isDocumentaryFormTypeOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasDocumentaryFormTypeOfAllMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasDocumentaryFormTypeOfSomeMembersOf: Rico.RecordSet | undefined;
  }
  return DocumentaryFormTypeClass as any
}
DocumentaryFormTypeMixin.appliesTo = rico.DocumentaryFormType
DocumentaryFormTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<DocumentaryFormType>([TypeMixin, DocumentaryFormTypeMixin], { types: [rico.DocumentaryFormType] }, env)
