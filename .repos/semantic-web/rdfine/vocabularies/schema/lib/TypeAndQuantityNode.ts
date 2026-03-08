import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface TypeAndQuantityNode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  amountOfThisGood: number | undefined;
  businessFunction: Schema.BusinessFunction | undefined;
  typeOfGood: Schema.Product<D> | Schema.Service<D> | undefined;
  unitCode: string | undefined;
  unitCodeTerm: RDF.NamedNode | undefined;
  unitText: string | undefined;
}

export function TypeAndQuantityNodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TypeAndQuantityNode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TypeAndQuantityNodeClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    amountOfThisGood: number | undefined;
    @rdfine.property()
    businessFunction: Schema.BusinessFunction | undefined;
    @rdfine.property.resource()
    typeOfGood: Schema.Product | Schema.Service | undefined;
    @rdfine.property.literal()
    unitCode: string | undefined;
    @rdfine.property({ path: schema.unitCode })
    unitCodeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    unitText: string | undefined;
  }
  return TypeAndQuantityNodeClass as any
}
TypeAndQuantityNodeMixin.appliesTo = schema.TypeAndQuantityNode
TypeAndQuantityNodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<TypeAndQuantityNode>([StructuredValueMixin, TypeAndQuantityNodeMixin], { types: [schema.TypeAndQuantityNode] }, env)
