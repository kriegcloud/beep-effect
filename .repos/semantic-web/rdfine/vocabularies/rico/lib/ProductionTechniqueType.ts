import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface ProductionTechniqueType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isProductionTechniqueTypeOf: Rico.Instantiation<D> | undefined;
}

export function ProductionTechniqueTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProductionTechniqueType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ProductionTechniqueTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Instantiation] })
    isProductionTechniqueTypeOf: Rico.Instantiation | undefined;
  }
  return ProductionTechniqueTypeClass as any
}
ProductionTechniqueTypeMixin.appliesTo = rico.ProductionTechniqueType
ProductionTechniqueTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProductionTechniqueType>([TypeMixin, ProductionTechniqueTypeMixin], { types: [rico.ProductionTechniqueType] }, env)
