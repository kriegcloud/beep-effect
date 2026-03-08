import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { KnowingRelationMixin } from './KnowingRelation.js';

export interface TeachingRelation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.KnowingRelation<D>, rdfine.RdfResource<D> {
  'teachingRelation_role': Rico.TeachingRelation<D> | undefined;
}

export function TeachingRelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TeachingRelation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class TeachingRelationClass extends KnowingRelationMixin(Resource) {
    @rdfine.property.resource({ as: [TeachingRelationMixin] })
    'teachingRelation_role': Rico.TeachingRelation | undefined;
  }
  return TeachingRelationClass as any
}
TeachingRelationMixin.appliesTo = rico.TeachingRelation
TeachingRelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TeachingRelation>([KnowingRelationMixin, TeachingRelationMixin], { types: [rico.TeachingRelation] }, env)
