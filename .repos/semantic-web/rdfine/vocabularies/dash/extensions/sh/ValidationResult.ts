import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Shacl from '@rdfine/shacl';

interface ValidationResultEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  fixed: boolean | undefined;
}

declare module '@rdfine/shacl/lib/ValidationResult' {
  interface ValidationResult<D extends RDF.DatasetCore> extends ValidationResultEx<D> {
  }
}

export function ValidationResultMixinEx<Base extends rdfine.ExtendingConstructor<Shacl.ValidationResult, ValidationResultEx>>(Resource: Base): rdfine.Constructor<ValidationResultEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements ValidationResultEx {
    @rdfine.property.literal({ type: Boolean })
    fixed: boolean | undefined;
  }
  return Impl
}
ValidationResultMixinEx.appliesTo = sh.ValidationResult
