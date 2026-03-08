import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Shacl from '@rdfine/shacl';

interface FunctionEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  cachable: boolean | undefined;
}

declare module '@rdfine/shacl/lib/Function' {
  interface Function<D extends RDF.DatasetCore> extends FunctionEx<D> {
  }
}

export function FunctionMixinEx<Base extends rdfine.ExtendingConstructor<Shacl.Function, FunctionEx>>(Resource: Base): rdfine.Constructor<FunctionEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements FunctionEx {
    @rdfine.property.literal({ type: Boolean })
    cachable: boolean | undefined;
  }
  return Impl
}
FunctionMixinEx.appliesTo = sh.Function
