import cf, { AnyPointer, GraphPointer } from 'clownface'
import { Debugger } from 'debug'
import { Stream } from '@rdfjs/types'
import rdf from '@zazuko/env'
import nsBuilder from '@rdfjs/namespace'
import prefixes, { expand } from '@zazuko/prefixes'
import { IndentationText, Project, QuoteKind, SourceFile } from 'ts-morph'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import FileSystem from './util/FileSystem.js'
import * as generator from './generator.js'
import * as EnumerationGenerator from './EnumerationGenerator/index.js'
import { EnumerationType, ExternalResourceType, ResourceType, TypeMap, TypeMetaCollection } from './types/index.js'
import * as MixinGenerator from './MixinGenerator/index.js'
import * as ExtensionMixinGenerator from './ExtensionMixinGenerator/index.js'
import * as factories from './types/metaFactories.js'
import { toUpperInitial } from './util/string.js'
import { expandMapKeys } from './util/overrideMap.js'
import { DatatypeName } from './types/wellKnownDatatypes.js'

type PropertyOverrides = Record<string, {
  values?: 'array' | 'list' | 'single' | Array<'array' | 'list' | 'single'>
}>

export interface Context {
  vocabulary: AnyPointer
  prefix: string
  defaultExport: string
  log: {
    debug: Debugger
    warn: Debugger
    error: Debugger
  }
  properties: PropertyOverrides
}

export interface WriteModule {
  project: Project
  types: TypeMetaCollection
  context: Context
  indexModule: SourceFile
  // eslint-disable-next-line no-use-before-define
  allGenerators: GeneratedModule[]
}

export interface GeneratedModule<T extends ResourceType | EnumerationType | ExternalResourceType = ResourceType | EnumerationType | ExternalResourceType> {
  node?: GraphPointer
  writeModule(params: WriteModule): void
}

export interface ModuleStrategy {
  (types: TypeMetaCollection, context: Context): GeneratedModule[]
}

export type TypeOverride = DatatypeName | 'NamedNode' | 'Datatype' | 'Term'

interface GeneratorOptions {
  stream: Stream
  namespace: string
  outDir: string
  prefix: string
  exclude?: string[]
  types?: Record<string, TypeOverride>
  properties?: PropertyOverrides
}

function assertOptions(options: Record<string, any>) {
  ['stream', 'outDir', 'prefix']
    .forEach(arg => {
      if (!options[arg]) {
        throw new Error(`Missing ${arg} parameter`)
      }
    })
}

export async function generate(options: GeneratorOptions, logger: Debugger) {
  assertOptions(options)

  if (options.namespace) {
    prefixes[options.prefix] = options.namespace
  }

  if (!prefixes[options.prefix]) {
    throw new Error(`The prefix ${options.prefix} is not known to @zazuko/prefixes. It has to provided as parameter`)
  }

  const dataset = await fromStream(rdf.dataset(), options.stream)
  const vocabulary = cf({ dataset })

  const project = new Project({
    fileSystem: new FileSystem(options.outDir),
    manipulationSettings: {
      useTrailingCommas: true,
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
  })

  const namespace = nsBuilder(prefixes[options.prefix])
  const excludedTerms = (options.exclude || [])
    .map(excludedTerm => {
      return excludedTerm.includes(':') ? rdf.namedNode(expand(excludedTerm)) : namespace(excludedTerm)
    })

  const strategies: ModuleStrategy[] = [
    EnumerationGenerator.findTermsToGenerate,
    MixinGenerator.findTermsToGenerate(excludedTerms),
    ExtensionMixinGenerator.findTermsToGenerate,
  ]

  const log = {
    debug: logger,
    error: logger.extend('error'),
    warn: logger.extend('warn'),
  }
  const context = {
    vocabulary,
    prefix: options.prefix,
    defaultExport: toUpperInitial(options.prefix),
    log,
    properties: expandMapKeys(options.properties, prefixes[options.prefix]),
  }
  const types = new TypeMap({
    excluded: excludedTerms,
    context,
    factories: [
      factories.overrides(expandMapKeys(options.types, prefixes[options.prefix])),
      factories.coreTerms,
      factories.datatypes,
      factories.enumerationTypes,
      factories.resourceTypes,
      factories.enumerationMembers,
    ],
  })

  log.error.enabled = true
  log.warn.enabled = true

  await generator.generate(project, types, strategies, context)
}
