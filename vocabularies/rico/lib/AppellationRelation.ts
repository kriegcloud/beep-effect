import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { RelationMixin } from './Relation.js';

export interface AppellationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Relation<D>, rdfine.RdfResource<D> {
  'appellationRelation_role': Rico.AppellationRelation<D> | undefined;
}

export function AppellationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AppellationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class AppellationRelationClass extends RelationMixin(Resource) {
    @rdfine.property.resource({ as: [AppellationRelationMixin] })
    'appellationRelation_role': Rico.AppellationRelation | undefined;
  }
  return AppellationRelationClass as any
}
AppellationRelationMixin.appliesTo = rico.AppellationRelation
AppellationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<AppellationRelation>([RelationMixin, AppellationRelationMixin], { types: [rico.AppellationRelation] }, env)
