import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ManagementRelationMixin } from './ManagementRelation.js';

export interface RecordResourceHoldingRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.ManagementRelation<D>, rdfine.RdfResource<D> {
  'recordResourceHoldingRelation_role': Rico.RecordResourceHoldingRelation<D> | undefined;
}

export function RecordResourceHoldingRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RecordResourceHoldingRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RecordResourceHoldingRelationClass extends ManagementRelationMixin(Resource) {
    @rdfine.property.resource({ as: [RecordResourceHoldingRelationMixin] })
    'recordResourceHoldingRelation_role': Rico.RecordResourceHoldingRelation | undefined;
  }
  return RecordResourceHoldingRelationClass as any
}
RecordResourceHoldingRelationMixin.appliesTo = rico.RecordResourceHoldingRelation
RecordResourceHoldingRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<RecordResourceHoldingRelation>([ManagementRelationMixin, RecordResourceHoldingRelationMixin], { types: [rico.RecordResourceHoldingRelation] }, env)
