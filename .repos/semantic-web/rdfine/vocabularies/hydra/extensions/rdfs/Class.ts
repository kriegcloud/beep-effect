import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import { hydra } from '../../lib/namespace.js';
import type * as Hydra from '../../index.js';
import type * as Rdfs from '@rdfine/rdfs';

interface ClassEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  supportedProperty: Array<Hydra.SupportedProperty<D>>;
}

declare module '@rdfine/rdfs/lib/Class' {
  interface Class<D extends RDF.DatasetCore> extends ClassEx<D> {
  }
}

export function ClassMixinEx<Base extends rdfine.ExtendingConstructor<Rdfs.Class, ClassEx>>(Resource: Base): rdfine.Constructor<ClassEx & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class Impl extends Resource implements ClassEx {
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.SupportedProperty] })
    supportedProperty!: Array<Hydra.SupportedProperty>;
  }
  return Impl
}
ClassMixinEx.appliesTo = rdfs.Class
