import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AuthorityRelationMixin } from './AuthorityRelation.js';

export interface ManagementRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.AuthorityRelation<D>, rdfine.RdfResource<D> {
  'managementRelation_role': Rico.ManagementRelation<D> | undefined;
}

export function ManagementRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ManagementRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ManagementRelationClass extends AuthorityRelationMixin(Resource) {
    @rdfine.property.resource({ as: [ManagementRelationMixin] })
    'managementRelation_role': Rico.ManagementRelation | undefined;
  }
  return ManagementRelationClass as any
}
ManagementRelationMixin.appliesTo = rico.ManagementRelation
ManagementRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ManagementRelation>([AuthorityRelationMixin, ManagementRelationMixin], { types: [rico.ManagementRelation] }, env)
