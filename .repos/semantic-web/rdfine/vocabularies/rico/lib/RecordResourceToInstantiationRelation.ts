import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface RecordResourceToInstantiationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'recordResourceToInstantiationRelation_role': Rico.RecordResourceToInstantiationRelation<D> | undefined;
}

export function RecordResourceToInstantiationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordResourceToInstantiationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordResourceToInstantiationRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [RecordResourceToInstantiationRelationMixin] })
    'recordResourceToInstantiationRelation_role': Rico.RecordResourceToInstantiationRelation | undefined;
  }
  return RecordResourceToInstantiationRelationClass as any
}
RecordResourceToInstantiationRelationMixin.appliesTo = rico.RecordResourceToInstantiationRelation
RecordResourceToInstantiationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordResourceToInstantiationRelation>([RelationMixin, RecordResourceToInstantiationRelationMixin], { types: [rico.RecordResourceToInstantiationRelation] }, env)
