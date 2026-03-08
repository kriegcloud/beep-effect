import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { DescendanceRelationMixin } from './DescendanceRelation.js';

export interface ChildRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.DescendanceRelation<D>, rdfine.RdfResource<D> {
  'childRelation_role': Rico.ChildRelation<D> | undefined;
}

export function ChildRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChildRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ChildRelationClass extends DescendanceRelationMixin(Resource) {
    @rdfine.property.resource({ as: [ChildRelationMixin] })
    'childRelation_role': Rico.ChildRelation | undefined;
  }
  return ChildRelationClass as any
}
ChildRelationMixin.appliesTo = rico.ChildRelation
ChildRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChildRelation>([DescendanceRelationMixin, ChildRelationMixin], { types: [rico.ChildRelation] }, env)
