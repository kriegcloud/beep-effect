import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface ContentType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isContentTypeOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasContentTypeOfAllMembersOf: Rico.RecordSet<D> | undefined;
  isOrWasContentTypeOfSomeMembersOf: Rico.RecordSet<D> | undefined;
}

export function ContentTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ContentType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ContentTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource()
    isContentTypeOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasContentTypeOfAllMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasContentTypeOfSomeMembersOf: Rico.RecordSet | undefined;
  }
  return ContentTypeClass as any
}
ContentTypeMixin.appliesTo = rico.ContentType
ContentTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<ContentType>([TypeMixin, ContentTypeMixin], { types: [rico.ContentType] }, env)
