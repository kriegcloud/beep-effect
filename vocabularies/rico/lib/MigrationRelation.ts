import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { DerivationRelationMixin } from './DerivationRelation.js';

export interface MigrationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.DerivationRelation<D>, rdfine.RdfResource<D> {
  'migrationRelation_role': Rico.MigrationRelation<D> | undefined;
}

export function MigrationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MigrationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class MigrationRelationClass extends DerivationRelationMixin(Resource) {
    @rdfine.property.resource({ as: [MigrationRelationMixin] })
    'migrationRelation_role': Rico.MigrationRelation | undefined;
  }
  return MigrationRelationClass as any
}
MigrationRelationMixin.appliesTo = rico.MigrationRelation
MigrationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MigrationRelation>([DerivationRelationMixin, MigrationRelationMixin], { types: [rico.MigrationRelation] }, env)
