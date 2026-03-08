import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface RecordState<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasRecordStateOfAllMembersOf: Rico.RecordSet<D> | undefined;
  isOrWasRecordStateOfSomeMembersOf: Rico.RecordSet<D> | undefined;
  isRecordStateOf: Rico.Record<D> | Rico.RecordPart<D> | undefined;
}

export function RecordStateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordState & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordStateClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasRecordStateOfAllMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isOrWasRecordStateOfSomeMembersOf: Rico.RecordSet | undefined;
    @rdfine.property.resource()
    isRecordStateOf: Rico.Record | Rico.RecordPart | undefined;
  }
  return RecordStateClass as any
}
RecordStateMixin.appliesTo = rico.RecordState
RecordStateMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordState>([TypeMixin, RecordStateMixin], { types: [rico.RecordState] }, env)
