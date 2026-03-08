import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RecordResourceMixin } from './RecordResource.js';

export interface Record<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.RecordResource<D>, rdfine.RdfResource<D> {
  hadConstituent: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasAuthor: Rico.Group<D> | Rico.Person<D> | Rico.Position<D> | undefined;
  hasConstituentTransitive: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasContentOfType: Rico.ContentType<D> | undefined;
  hasDirectConstituent: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasDocumentaryFormType: Rico.DocumentaryFormType<D> | undefined;
  hasDraft: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasOrHadConstituent: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasOrHadLanguage: Rico.Language<D> | undefined;
  hasOrHadLegalStatus: Rico.LegalStatus<D> | undefined;
  hasOriginal: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  hasRecordState: Rico.RecordState<D> | undefined;
  isConstituentOfTransitive: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isDirectConstituentOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isDirectlyIncludedIn: Rico.RecordSet<D> | undefined;
  isDraftOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isIncludedInTransitive: Rico.RecordSet<D> | undefined;
  isOriginalOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasConstituentOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasIncludedIn: Rico.RecordSet<D> | undefined;
  wasConstituentOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  wasIncludedIn: Rico.RecordSet<D> | undefined;
}

export function RecordMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Record & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordClass extends RecordResourceMixin(Resource) {
    @rdfine.property.resource()
    hadConstituent: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    hasAuthor: Rico.Group | Rico.Person | Rico.Position | undefined;
    @rdfine.property.resource()
    hasConstituentTransitive: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.ContentType] })
    hasContentOfType: Rico.ContentType | undefined;
    @rdfine.property.resource()
    hasDirectConstituent: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.DocumentaryFormType] })
    hasDocumentaryFormType: Rico.DocumentaryFormType | undefined;
    @rdfine.property.resource()
    hasDraft: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    hasOrHadConstituent: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Language] })
    hasOrHadLanguage: Rico.Language | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.LegalStatus] })
    hasOrHadLegalStatus: Rico.LegalStatus | undefined;
    @rdfine.property.resource()
    hasOriginal: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordState] })
    hasRecordState: Rico.RecordState | undefined;
    @rdfine.property.resource()
    isConstituentOfTransitive: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    isDirectConstituentOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isDirectlyIncludedIn: Rico.RecordSet | undefined;
    @rdfine.property.resource()
    isDraftOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isIncludedInTransitive: Rico.RecordSet | undefined;
    @rdfine.property.resource()
    isOriginalOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    isOrWasConstituentOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasIncludedIn: Rico.RecordSet | undefined;
    @rdfine.property.resource()
    wasConstituentOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    wasIncludedIn: Rico.RecordSet | undefined;
  }
  return RecordClass as any
}
RecordMixin.appliesTo = rico.Record
RecordMixin.createFactory = (env: RdfineEnvironment) => createFactory<Record>([RecordResourceMixin, RecordMixin], { types: [rico.Record] }, env)
