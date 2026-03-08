import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface RecordSetType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isRecordSetTypeOf: Rico.RecordSet<D> | undefined;
}

export function RecordSetTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordSetType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordSetTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.RecordSet] })
    isRecordSetTypeOf: Rico.RecordSet | undefined;
  }
  return RecordSetTypeClass as any
}
RecordSetTypeMixin.appliesTo = rico.RecordSetType
RecordSetTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordSetType>([TypeMixin, RecordSetTypeMixin], { types: [rico.RecordSetType] }, env)
