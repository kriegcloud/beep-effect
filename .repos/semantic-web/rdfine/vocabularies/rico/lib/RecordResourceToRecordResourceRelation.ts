import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface RecordResourceToRecordResourceRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'recordResourceToRecordResourceRelation_role': Rico.RecordResourceToRecordResourceRelation<D> | undefined;
}

export function RecordResourceToRecordResourceRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordResourceToRecordResourceRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordResourceToRecordResourceRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [RecordResourceToRecordResourceRelationMixin] })
    'recordResourceToRecordResourceRelation_role': Rico.RecordResourceToRecordResourceRelation | undefined;
  }
  return RecordResourceToRecordResourceRelationClass as any
}
RecordResourceToRecordResourceRelationMixin.appliesTo = rico.RecordResourceToRecordResourceRelation
RecordResourceToRecordResourceRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordResourceToRecordResourceRelation>([RelationMixin, RecordResourceToRecordResourceRelationMixin], { types: [rico.RecordResourceToRecordResourceRelation] }, env)
