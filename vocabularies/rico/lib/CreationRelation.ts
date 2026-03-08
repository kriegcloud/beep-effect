import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { OrganicProvenanceRelationMixin } from './OrganicProvenanceRelation.js';

export interface CreationRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.OrganicProvenanceRelation<D>, rdfine.RdfResource<D> {
  'creationRelation_role': Rico.CreationRelation<D> | undefined;
  creationWithRole: Rico.RoleType<D> | undefined;
}

export function CreationRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CreationRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class CreationRelationClass extends OrganicProvenanceRelationMixin(Resource) {
    @rdfine.property.resource({ as: [CreationRelationMixin] })
    'creationRelation_role': Rico.CreationRelation | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RoleType] })
    creationWithRole: Rico.RoleType | undefined;
  }
  return CreationRelationClass as any
}
CreationRelationMixin.appliesTo = rico.CreationRelation
CreationRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<CreationRelation>([OrganicProvenanceRelationMixin, CreationRelationMixin], { types: [rico.CreationRelation] }, env)
