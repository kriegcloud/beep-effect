import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Shacl from '@rdfine/shacl';

interface AbstractResultEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  suggestion: Array<Dash.Suggestion<D>>;
}

declare module '@rdfine/shacl/lib/AbstractResult' {
  interface AbstractResult<D extends RDF.DatasetCore> extends AbstractResultEx<D> {
  }
}

export function AbstractResultMixinEx<Base extends rdfine.ExtendingConstructor<Shacl.AbstractResult, AbstractResultEx>>(Resource: Base): rdfine.Constructor<AbstractResultEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements AbstractResultEx {
    @rdfine.property.resource({ values: 'array', implicitTypes: [dash.Suggestion] })
    suggestion!: Array<Dash.Suggestion>;
  }
  return Impl
}
AbstractResultMixinEx.appliesTo = sh.AbstractResult
