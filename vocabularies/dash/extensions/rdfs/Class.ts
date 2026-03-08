import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Rdfs from '@rdfine/rdfs';

interface ClassEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  abstract: boolean | undefined;
  resourceAction: Array<Dash.ResourceAction<D>>;
}

declare module '@rdfine/rdfs/lib/Class' {
  interface Class<D extends RDF.DatasetCore> extends ClassEx<D> {
  }
}

export function ClassMixinEx<Base extends rdfine.ExtendingConstructor<Rdfs.Class, ClassEx>>(Resource: Base): rdfine.Constructor<ClassEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements ClassEx {
    @rdfine.property.literal({ type: Boolean })
    abstract: boolean | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [dash.ResourceAction] })
    resourceAction!: Array<Dash.ResourceAction>;
  }
  return Impl
}
ClassMixinEx.appliesTo = rdfs.Class
