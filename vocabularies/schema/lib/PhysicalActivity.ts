import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LifestyleModificationMixin } from './LifestyleModification.js';

export interface PhysicalActivity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LifestyleModification<D>, rdfine.RdfResource<D> {
  associatedAnatomy: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | Schema.SuperficialAnatomy<D> | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  epidemiology: string | undefined;
  pathophysiology: string | undefined;
}

export function PhysicalActivityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PhysicalActivity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PhysicalActivityClass extends LifestyleModificationMixin(Resource) {
    @rdfine.property.resource()
    associatedAnatomy: Schema.AnatomicalStructure | Schema.AnatomicalSystem | Schema.SuperficialAnatomy | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.literal()
    epidemiology: string | undefined;
    @rdfine.property.literal()
    pathophysiology: string | undefined;
  }
  return PhysicalActivityClass as any
}
PhysicalActivityMixin.appliesTo = schema.PhysicalActivity
PhysicalActivityMixin.createFactory = (env: RdfineEnvironment) => createFactory<PhysicalActivity>([LifestyleModificationMixin, PhysicalActivityMixin], { types: [schema.PhysicalActivity] }, env)
