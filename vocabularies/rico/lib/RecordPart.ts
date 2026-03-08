import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RecordResourceMixin } from './RecordResource.js';

export interface RecordPart<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.RecordResource<D>, rdfine.RdfResource<D> {
  hadConstituent: Rico.Record<D> | Rico.RecordPart<D> | undefined;
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
  isDraftOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOriginalOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  isOrWasConstituentOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
  wasConstituentOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
}

export function RecordPartMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordPart & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordPartClass extends RecordResourceMixin(Resource) {
    @rdfine.property.resource()
    hadConstituent: Rico.Record | Rico.RecordPart | undefined;
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
    @rdfine.property.resource()
    isDraftOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    isOriginalOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    isOrWasConstituentOf: Rico.Record | Rico.RecordPart | undefined;
    @rdfine.property.resource()
    wasConstituentOf: Rico.Record | Rico.RecordPart | undefined;
  }
  return RecordPartClass as any
}
RecordPartMixin.appliesTo = rico.RecordPart
RecordPartMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordPart>([RecordResourceMixin, RecordPartMixin], { types: [rico.RecordPart] }, env)
