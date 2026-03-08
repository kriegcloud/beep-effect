import { Project, SourceFile } from 'ts-morph'
import cf, { AnyPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { xsd } from '@tpluscode/rdf-ns-builders'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { MixinModule } from '../../lib/MixinGenerator/MixinModule.js'
import { FakeTypeCollection } from '../_helpers/FakeTypeCollection.js'
import { ex } from '../_helpers/prefix.js'
import { fakeLog } from '../_helpers/util.js'

describe('MixinModule', () => {
  let project: Project
  let vocabulary: AnyPointer
  let indexModule: SourceFile

  chai.use(jestSnapshotPlugin())
  before(() => import('../../../../__tests__/helpers/matchers.js'))

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
    })
    indexModule = project.createSourceFile('index.ts')

    vocabulary = cf({ dataset: $rdf.dataset() })
  })

  it('generates a mixin class without props', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [])

    // when
    module.writeModule({
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      indexModule,
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates a mixin class where term is not safe identifier', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex['3Class']), {
      type: 'Resource',
      localName: '_3Class',
      qualifiedName: 'Example._3Class',
      module: './3Class',
      mixinName: '_3ClassMixin',
      term: '3Class',
    }, [], [])

    // when
    module.writeModule({
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
      indexModule,
    })

    // then
    expect(project.getSourceFile('3Class.ts')).toMatchSnapshot()
  })

  it('generates a mixin class with external super classes', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [{
      type: 'ExternalResource' as const,
      localName: 'Person',
      mixinName: 'PersonMixin',
      module: '@rdfine/schema/Person',
      qualifiedName: 'Schema.Person',
      package: '@rdfine/schema',
      qualifier: 'Schema',
      qualifiedMixinName: 'Schema.PersonMixin',
      exportName: 'Person',
    }], [])

    // when
    module.writeModule({
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
      indexModule,
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates property with automatic type cast when predicate has strict semantics', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'Resource' as const,
        mixinName: 'FooMixin',
        module: './Foo',
        localName: 'Foo',
        qualifiedName: 'Example.Foo',
        term: 'Foo',
      }],
    }])

    // when
    module.writeModule({
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
      indexModule,
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates array property', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource',
      prefixedTerm: 'ex.foo',
      semantics: 'loose',
      termName: 'foo',
      values: ['array'],
      range: [{
        type: 'Resource',
        mixinName: 'FooMixin',
        module: './Foo',
        localName: 'Foo',
        qualifiedName: 'Example.Foo',
        term: 'Foo',
      }],
    }])

    // when
    module.writeModule({
      project,
      indexModule,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates list property', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource',
      prefixedTerm: 'ex.foo',
      semantics: 'loose',
      termName: 'foo',
      values: ['list'],
      range: [{
        type: 'Resource',
        mixinName: 'FooMixin',
        module: './Foo',
        localName: 'Foo',
        qualifiedName: 'Example.Foo',
        term: 'Foo',
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates list/single property', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource',
      prefixedTerm: 'ex.foo',
      semantics: 'loose',
      termName: 'foo',
      values: ['list', 'single'],
      range: [{
        type: 'Resource',
        mixinName: 'FooMixin',
        module: './Foo',
        localName: 'Foo',
        qualifiedName: 'Example.Foo',
        term: 'Foo',
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('does not try import self when property has range of enclosing class', () => {
    // given
    const generateType = {
      type: 'Resource' as const,
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }
    const module = new MixinModule(vocabulary.node(ex.Class), generateType, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [generateType],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates property with automatic external type cast when predicate has strict semantics', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'ExternalResource' as const,
        localName: 'Foo',
        mixinName: 'FooMixin',
        exportName: 'Foo',
        module: '@rdfine/example/Foo',
        qualifiedName: 'Example.Foo',
        package: '@rdfine/example',
        qualifier: 'Example',
        qualifiedMixinName: 'Example.FooMixin',
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates property with datatype-annotated literal', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'literal' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'Literal' as const,
        nativeName: 'string',
        nativeType: String,
        datatype: xsd.anyURI,
      }, {
        type: 'Literal' as const,
        nativeName: 'string',
        nativeType: Number,
        datatype: xsd.anyURI,
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates date property', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'literal' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'Literal' as const,
        nativeName: 'Date',
        nativeType: Date,
        datatype: xsd.date,
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates literal property with unioned string return types', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'literal' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'Constant',
        value: 'foo',
      }, {
        type: 'Constant',
        value: 'bar',
      }, {
        type: 'Constant',
        value: 'baz',
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('wraps property name in quotes when term has non-alpha characters', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex('foo-bar'),
      name: 'foo-bar',
      type: 'literal' as const,
      prefixedTerm: "ex['foo-bar']",
      semantics: 'loose',
      termName: 'foo-bar',
      range: [{
        type: 'Literal' as const,
        nativeName: 'string',
        nativeType: Number,
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('does not add datatype annotation to literal property when datatype is ambiguous', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'literal' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'strict' as const,
      termName: 'foo',
      range: [{
        type: 'Literal' as const,
        nativeName: 'string',
        nativeType: String,
        datatype: xsd.anyURI,
      }, {
        type: 'Literal' as const,
        nativeName: 'string',
        nativeType: Number,
        datatype: xsd.int,
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('Class.ts')).toMatchSnapshot()
  })

  it('generates a bundle module with property mixin types but skipping external mixins', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [], [{
      term: ex.foo,
      name: 'foo',
      type: 'resource' as const,
      prefixedTerm: 'ex.foo',
      semantics: 'loose' as const,
      termName: 'foo',
      range: [{
        type: 'ExternalResource' as const,
        localName: 'Foo',
        mixinName: 'FooMixin',
        exportName: 'Foo',
        module: '@rdfine/example/Foo',
        qualifiedName: 'Example.Foo',
        package: '@rdfine/example',
        qualifier: 'Example',
        qualifiedMixinName: 'Example.FooMixin',
      }, {
        type: 'Resource' as const,
        localName: 'Friend',
        module: './Friend',
        qualifiedName: 'Example.Friend',
        mixinName: 'FriendMixin',
        term: 'Friend',
      }],
    }])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('bundles/Class.ts')).toMatchSnapshot()
    expect(project.getSourceFile('bundles/index.ts')).toMatchSnapshot()
  })

  it('generates a bundle module with super classes but without externals', () => {
    // given
    const module = new MixinModule(vocabulary.node(ex.Class), {
      type: 'Resource',
      localName: 'Class',
      qualifiedName: 'Example.Class',
      module: './Class',
      mixinName: 'ClassMixin',
      term: 'Class',
    }, [{
      type: 'Resource' as const,
      mixinName: 'SuperMixin',
      qualifiedName: 'Example.Super',
      module: './Example',
      localName: 'Super',
      term: 'Super',
    }, {
      type: 'ExternalResource' as const,
      localName: 'Extern',
      mixinName: 'ExternMixin',
      exportName: 'Extern',
      qualifiedName: 'Example.Extern',
      module: 'Extern',
      qualifiedMixinName: 'Example.FooExtern',
      package: 'Extern',
      qualifier: 'Foo',
    }], [])

    // when
    module.writeModule({
      indexModule,
      project,
      types: new FakeTypeCollection(),
      context: {
        prefix: 'ex',
        defaultExport: 'Example',
        log: fakeLog(),
        vocabulary,
        properties: {},
      },
      allGenerators: [],
    })

    // then
    expect(project.getSourceFile('bundles/Class.ts')).toMatchSnapshot()
    expect(project.getSourceFile('bundles/index.ts')).toMatchSnapshot()
  })
})
