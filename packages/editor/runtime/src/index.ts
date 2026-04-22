/**
 * Effect-first sidecar runtime for serving the local editor control plane.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  createPageDocument,
  createWorkspaceManifest,
  type ExportFormat,
  makePageSummary,
  makeParagraphBlock,
  makeRevisionRecord,
  normalizePageSlug,
  PageDocument,
  type PageExport,
  type PageSummary,
  pageToExport,
  pageToPlainText,
  RevisionRecord,
  refreshPageDocument,
  WorkspaceManifest,
} from "@beep/editor";
import {
  EditorControlPlaneApi,
  type EditorControlPlaneErrorPayload,
  type EditorPageResource,
  type EditorWorkspaceSnapshot,
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarBootstrapStdoutEvent,
  type SidecarHealthStatus,
  SidecarInternalErrorPayload,
  SidecarNotFoundPayload,
} from "@beep/editor-protocol";
import { $EditorRuntimeId } from "@beep/identity/packages";
import { FilePath, NonEmptyTrimmedStr, NonNegativeInt, Slug, StatusCauseTaggedErrorClass } from "@beep/schema";
import { thunkFalse, thunkSome } from "@beep/utils";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Cause, Config, DateTime, Deferred, Effect, Fiber, FileSystem, Layer, Path, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";

const $I = $EditorRuntimeId.create("index");
const defaultHost = "127.0.0.1";
const defaultPort = 8789;
const defaultVersion = "0.0.0";
const defaultAppDataDir = ".beep/editor-app";
const defaultWorkspaceName = NonEmptyTrimmedStr.make("Editor Workspace");
const defaultHomeTitle = NonEmptyTrimmedStr.make("Home");

const editorFileSystemLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);
const SidecarPort = NonNegativeInt.pipe(
  S.check(S.isGreaterThan(0)),
  S.annotate(
    $I.annote("SidecarPort", {
      description: "Configured TCP port for the editor sidecar runtime.",
    })
  )
);
const supportedExportFormats = ["json", "markdown"] as const;

/**
 * Startup configuration for the editor sidecar runtime.
 *
 * @example
 * ```ts
 * import { EditorRuntimeConfig } from "@beep/editor-runtime"
 * import { FilePath, NonNegativeInt } from "@beep/schema"
 *
 * const config = new EditorRuntimeConfig({
 *   host: "127.0.0.1",
 *   port: NonNegativeInt.make(8789),
 *   appDataDir: FilePath.make("/tmp/beep-editor"),
 *   sessionId: "editor-session",
 *   version: "0.0.0",
 * })
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EditorRuntimeConfig extends S.Class<EditorRuntimeConfig>($I`EditorRuntimeConfig`)(
  {
    host: S.String,
    port: SidecarPort,
    appDataDir: FilePath,
    sessionId: S.String,
    version: S.String,
  },
  $I.annote("EditorRuntimeConfig", {
    description: "Startup configuration for the editor sidecar runtime.",
  })
) {}

/**
 * Typed runtime error for editor sidecar bootstrap and persistence workflows.
 *
 * @example
 * ```ts
 * import { EditorRuntimeError } from "@beep/editor-runtime"
 *
 * const error = EditorRuntimeError.noCause("Editor runtime failed.", 500)
 * void error
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export class EditorRuntimeError extends StatusCauseTaggedErrorClass<EditorRuntimeError>($I`EditorRuntimeError`)(
  "EditorRuntimeError",
  $I.annote("EditorRuntimeError", {
    description: "Typed runtime error for editor sidecar bootstrap and persistence workflows.",
  })
) {}

const WorkspaceManifestJson = S.fromJsonString(WorkspaceManifest);
const encodeWorkspaceManifestJson = S.encodeUnknownSync(WorkspaceManifestJson);
const decodeWorkspaceManifestJson = S.decodeUnknownEffect(WorkspaceManifestJson);
const PageDocumentJson = S.fromJsonString(PageDocument);
const encodePageDocumentJson = S.encodeUnknownSync(PageDocumentJson);
const decodePageDocumentJson = S.decodeUnknownEffect(PageDocumentJson);
const RevisionRecordJson = S.fromJsonString(RevisionRecord);
const encodeRevisionRecordJson = S.encodeUnknownSync(RevisionRecordJson);
const BootstrapStdoutJson = S.fromJsonString(SidecarBootstrapStdoutEvent);
const encodeBootstrapStdoutJson = S.encodeUnknownEffect(BootstrapStdoutJson);

const internalRunnerHost = (host: string): string => {
  if (host === "0.0.0.0") {
    return "127.0.0.1";
  }

  if (host === "::") {
    return "::1";
  }

  return host;
};

const makeBootstrap = (config: EditorRuntimeConfig, startedAt: DateTime.Utc, status: typeof SidecarHealthStatus.Type) =>
  new SidecarBootstrap({
    sessionId: config.sessionId,
    host: config.host,
    port: config.port,
    baseUrl: `http://${internalRunnerHost(config.host)}:${config.port}`,
    pid: NonNegativeInt.make(process.pid),
    version: config.version,
    status,
    startedAt,
  });

const hasMessage = (
  input: unknown
): input is {
  readonly message: string;
} => P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const unknownMessage = (cause: Cause.Cause<unknown>): string => {
  const error = Cause.squash(cause);

  if (hasMessage(error)) {
    return error.message;
  }

  return "Editor sidecar request failed.";
};

const toControlPlanePayload = (cause: Cause.Cause<unknown>): EditorControlPlaneErrorPayload => {
  const error = Cause.squash(cause);

  if (S.is(EditorRuntimeError)(error)) {
    if (error.status === 400) {
      return new SidecarBadRequestPayload({
        message: error.message,
        status: 400,
      });
    }

    if (error.status === 404) {
      return new SidecarNotFoundPayload({
        message: error.message,
        status: 404,
      });
    }
  }

  return new SidecarInternalErrorPayload({
    message: unknownMessage(cause),
    status: 500,
  });
};

const handleInternalControlPlane = <A>(effect: Effect.Effect<A, EditorRuntimeError>) =>
  effect.pipe(
    Effect.catchCause((cause) =>
      Effect.fail(
        new SidecarInternalErrorPayload({
          message: unknownMessage(cause),
          status: 500,
        })
      )
    )
  );

const handleResourceControlPlane = <A>(effect: Effect.Effect<A, EditorRuntimeError>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toControlPlanePayload(cause))));

type EditorWorkspaceStore = {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, EditorRuntimeError>;
  readonly getWorkspace: Effect.Effect<EditorWorkspaceSnapshot, EditorRuntimeError>;
  readonly listPages: Effect.Effect<ReadonlyArray<PageSummary>, EditorRuntimeError>;
  readonly getPage: (slug: string) => Effect.Effect<EditorPageResource, EditorRuntimeError>;
  readonly savePage: (slug: string, page: PageDocument) => Effect.Effect<EditorPageResource, EditorRuntimeError>;
  readonly exportPage: (slug: string, format: ExportFormat) => Effect.Effect<PageExport, EditorRuntimeError>;
  readonly searchPages: (query: string) => Effect.Effect<ReadonlyArray<PageSummary>, EditorRuntimeError>;
};

const makeEditorWorkspaceStore = Effect.fn("EditorRuntime.makeWorkspaceStore")(function* (
  config: EditorRuntimeConfig,
  startedAt: DateTime.Utc
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const workspaceRoot = path.resolve(config.appDataDir, "workspace");
  const manifestPath = path.resolve(workspaceRoot, "manifest.json");
  const pagesDirectory = path.resolve(workspaceRoot, "pages");
  const revisionsDirectory = path.resolve(workspaceRoot, "revisions");

  const readPageFile = Effect.fn("EditorRuntime.readPageFile")(function* (filePath: string) {
    const raw = yield* fs
      .readFileString(filePath)
      .pipe(EditorRuntimeError.mapError(`Failed to read "${filePath}".`, 500));

    return yield* decodePageDocumentJson(raw).pipe(EditorRuntimeError.mapError(`Failed to decode "${filePath}".`, 500));
  });

  const writeManifest = Effect.fn("EditorRuntime.writeManifest")(function* (manifest: WorkspaceManifest) {
    yield* fs
      .writeFileString(manifestPath, encodeWorkspaceManifestJson(manifest))
      .pipe(EditorRuntimeError.mapError(`Failed to write "${manifestPath}".`, 500));
  });

  const writePage = Effect.fn("EditorRuntime.writePage")(function* (page: PageDocument) {
    yield* fs
      .writeFileString(path.resolve(pagesDirectory, `${page.slug}.json`), encodePageDocumentJson(page))
      .pipe(EditorRuntimeError.mapError(`Failed to persist page "${page.slug}".`, 500));
  });

  const writeRevision = Effect.fn("EditorRuntime.writeRevision")(function* (
    page: PageDocument,
    savedAt: DateTime.Utc,
    reason: string
  ) {
    const revision = makeRevisionRecord(page, savedAt, reason);
    yield* fs
      .writeFileString(path.resolve(revisionsDirectory, `${revision.id}.json`), encodeRevisionRecordJson(revision))
      .pipe(EditorRuntimeError.mapError(`Failed to persist revision for "${page.slug}".`, 500));
  });

  const ensureWorkspaceScaffold = Effect.fn("EditorRuntime.ensureWorkspaceScaffold")(function* () {
    yield* fs
      .makeDirectory(pagesDirectory, { recursive: true })
      .pipe(EditorRuntimeError.mapError(`Failed to create "${pagesDirectory}".`, 500));
    yield* fs
      .makeDirectory(revisionsDirectory, { recursive: true })
      .pipe(EditorRuntimeError.mapError(`Failed to create "${revisionsDirectory}".`, 500));

    const manifestExists = yield* fs.exists(manifestPath).pipe(Effect.orElseSucceed(thunkFalse));

    if (manifestExists) {
      return;
    }

    const now = yield* DateTime.now;
    const homePage = createPageDocument({
      title: defaultHomeTitle,
      slug: normalizePageSlug("home"),
      blocks: [makeParagraphBlock("Welcome to Editor App. Build knowledge here and export it anywhere later.")],
      now,
    });
    const manifest = createWorkspaceManifest({
      name: defaultWorkspaceName,
      rootPageSlug: homePage.slug,
      now,
    });

    yield* writeManifest(manifest);
    yield* writePage(homePage);
    yield* writeRevision(homePage, now, "seed");
  });

  const readManifest = Effect.fn("EditorRuntime.readManifest")(function* () {
    yield* ensureWorkspaceScaffold();
    const raw = yield* fs
      .readFileString(manifestPath)
      .pipe(EditorRuntimeError.mapError(`Failed to read "${manifestPath}".`, 500));

    return yield* decodeWorkspaceManifestJson(raw).pipe(
      EditorRuntimeError.mapError(`Failed to decode "${manifestPath}".`, 500)
    );
  });

  const listAllPages = Effect.fn("EditorRuntime.listAllPages")(function* () {
    yield* ensureWorkspaceScaffold();
    const entries = yield* fs
      .readDirectory(pagesDirectory)
      .pipe(EditorRuntimeError.mapError(`Failed to read "${pagesDirectory}".`, 500));

    const jsonEntries = pipe(entries, A.filter(Str.endsWith(".json")));

    return yield* Effect.forEach(jsonEntries, (entry) => readPageFile(path.resolve(pagesDirectory, entry)), {
      concurrency: 8,
    }).pipe(Effect.map(A.fromIterable));
  });

  const readPageBySlug = Effect.fn("EditorRuntime.readPageBySlug")(function* (slug: string) {
    const normalizedSlug = pipe(
      slug,
      Slug.makeOption,
      O.getOrElse(() => normalizePageSlug(slug))
    );
    const filePath = path.resolve(pagesDirectory, `${normalizedSlug}.json`);
    const fileExists = yield* fs.exists(filePath).pipe(Effect.orElseSucceed(thunkFalse));

    if (!fileExists) {
      return yield* EditorRuntimeError.noCause(`Page "${normalizedSlug}" was not found.`, 404);
    }

    return yield* readPageFile(filePath);
  });

  const pagesLinkingToSlug = (pages: ReadonlyArray<PageDocument>, slug: string): ReadonlyArray<PageDocument> =>
    pipe(
      pages,
      A.filter((page) =>
        pipe(
          page.outboundLinks,
          O.fromNullishOr,
          O.getOrElse(A.empty<NonNullable<PageDocument["outboundLinks"]>[number]>),
          A.some((link) => Eq.equals(slug)(link.targetSlug))
        )
      )
    );

  const backlinkCountForPages = (pages: ReadonlyArray<PageDocument>, slug: string): number =>
    pipe(pagesLinkingToSlug(pages, slug), A.length);

  const summaryForPage: {
    (page: PageDocument, pages: ReadonlyArray<PageDocument>): PageSummary;
    (pages: ReadonlyArray<PageDocument>): (page: PageDocument) => PageSummary;
  } = dual(
    2,
    (pages: ReadonlyArray<PageDocument>, page: PageDocument): PageSummary =>
      makePageSummary(page, backlinkCountForPages(pages, page.slug))
  );

  const listPageSummaries = Effect.fn("EditorRuntime.listPageSummaries")(function* () {
    const pages = yield* listAllPages();
    return pipe(pages, A.map(summaryForPage(pages)));
  });

  const getBacklinks = Effect.fn("EditorRuntime.getBacklinks")(function* (slug: string) {
    const pages = yield* listAllPages();

    return pipe(pagesLinkingToSlug(pages, slug), A.map(summaryForPage(pages)));
  });

  const readExistingPage = Effect.fn("EditorRuntime.readExistingPage")(function* (slug: string) {
    return yield* readPageBySlug(slug).pipe(
      Effect.map(O.some),
      Effect.catchTag("EditorRuntimeError", (error) =>
        error.status === 404 ? Effect.succeed(O.none()) : Effect.fail(error)
      )
    );
  });

  return {
    bootstrap: Effect.succeed(makeBootstrap(config, startedAt, "healthy")),
    getWorkspace: Effect.gen(function* () {
      const workspace = yield* readManifest();
      const pages = yield* listPageSummaries();

      return {
        workspace,
        pages,
        exportFormats: A.fromIterable(supportedExportFormats),
      } satisfies EditorWorkspaceSnapshot;
    }),
    listPages: listPageSummaries(),
    getPage: Effect.fn("EditorRuntime.getPage")(function* (slug: string) {
      const page = yield* readPageBySlug(slug);
      const backlinks = yield* getBacklinks(page.slug);

      return {
        page,
        backlinks,
      } satisfies EditorPageResource;
    }),
    savePage: Effect.fn("EditorRuntime.savePage")(function* (slug: string, page: PageDocument) {
      if (slug !== page.slug) {
        return yield* EditorRuntimeError.noCause(
          `Route slug "${slug}" does not match payload slug "${page.slug}".`,
          400
        );
      }

      const existingPage = yield* readExistingPage(slug);
      const now = yield* DateTime.now;
      const nextPage = O.match(existingPage, {
        onNone: () =>
          refreshPageDocument(page, {
            title: page.title,
            slug: page.slug,
            blocks: page.blocks,
            now,
          }),
        onSome: (current) =>
          refreshPageDocument(current, {
            title: page.title,
            slug: page.slug,
            blocks: page.blocks,
            now,
          }),
      });
      const manifest = yield* readManifest();
      const nextManifest = new WorkspaceManifest({
        ...manifest,
        rootPageSlug: pipe(manifest.rootPageSlug, O.orElse(thunkSome(nextPage.slug))),
        updatedAt: now,
      });

      yield* writePage(nextPage);
      yield* writeRevision(nextPage, now, O.isSome(existingPage) ? "save" : "create");
      yield* writeManifest(nextManifest);

      return yield* Effect.gen(function* () {
        const backlinks = yield* getBacklinks(nextPage.slug);

        return {
          page: nextPage,
          backlinks,
        } satisfies EditorPageResource;
      });
    }),
    exportPage: Effect.fn("EditorRuntime.exportPage")(function* (slug: string, format: ExportFormat) {
      const page = yield* readPageBySlug(slug);
      return pageToExport(page, format);
    }),
    searchPages: Effect.fn("EditorRuntime.searchPages")(function* (query: string) {
      const trimmedQuery = pipe(query, Str.trim, Str.toLowerCase);

      if (Str.isEmpty(trimmedQuery)) {
        return yield* listPageSummaries();
      }

      const pages = yield* listAllPages();

      return pipe(
        pages,
        A.filter((page) => {
          const titleMatches = pipe(page.title, Str.toLowerCase, Str.includes(trimmedQuery));
          const contentMatches = pipe(pageToPlainText(page), Str.toLowerCase, Str.includes(trimmedQuery));

          return titleMatches || contentMatches;
        }),
        A.map(summaryForPage(pages))
      );
    }),
  } satisfies EditorWorkspaceStore;
});

const emitBootstrapStdoutLine = Effect.fn("EditorRuntime.emitBootstrapStdoutLine")(function* (
  config: EditorRuntimeConfig,
  startedAt: DateTime.Utc
) {
  const bootstrap = makeBootstrap(config, startedAt, "healthy");
  const encoded = yield* encodeBootstrapStdoutJson(
    new SidecarBootstrapStdoutEvent({
      type: "bootstrap",
      sessionId: bootstrap.sessionId,
      host: bootstrap.host,
      port: bootstrap.port,
      baseUrl: bootstrap.baseUrl,
      pid: bootstrap.pid,
      version: bootstrap.version,
      status: bootstrap.status,
      startedAt: DateTime.toEpochMillis(bootstrap.startedAt),
    })
  ).pipe(EditorRuntimeError.mapError("Failed to encode the editor bootstrap line.", 500));

  yield* Effect.sync(() => {
    process.stdout.write(`${encoded}\n`);
  });
});

const controlPlaneHandlersLayer = (config: EditorRuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const store = yield* makeEditorWorkspaceStore(config, startedAt);

      return Layer.mergeAll(
        HttpApiBuilder.group(EditorControlPlaneApi, "system", (handlers) =>
          handlers.handle("health", () => handleInternalControlPlane(store.bootstrap))
        ),
        HttpApiBuilder.group(EditorControlPlaneApi, "workspace", (handlers) =>
          handlers.handle("getWorkspace", () => handleInternalControlPlane(store.getWorkspace))
        ),
        HttpApiBuilder.group(EditorControlPlaneApi, "pages", (handlers) =>
          handlers
            .handle("listPages", () => handleInternalControlPlane(store.listPages))
            .handle("searchPages", ({ query }) => handleInternalControlPlane(store.searchPages(query.query)))
            .handle("getPage", ({ params }) => handleResourceControlPlane(store.getPage(params.slug)))
            .handle("savePage", ({ params, payload }) =>
              handleResourceControlPlane(store.savePage(params.slug, payload))
            )
            .handle("exportPage", ({ params }) =>
              handleResourceControlPlane(store.exportPage(params.slug, params.format))
            )
        )
      );
    })
  ).pipe(Layer.provide(editorFileSystemLayer));

const sidecarLayer = (config: EditorRuntimeConfig, startedAt: DateTime.Utc) => {
  const apiLayer = HttpApiBuilder.layer(EditorControlPlaneApi).pipe(
    Layer.provide(controlPlaneHandlersLayer(config, startedAt))
  );

  return HttpRouter.serve(apiLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(
      Layer.fresh(
        BunHttpServer.layer({
          hostname: config.host,
          port: config.port,
        })
      )
    )
  );
};

const launchEditorSidecar = (config: EditorRuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.launch(Layer.fresh(sidecarLayer(config, startedAt))).pipe(
    EditorRuntimeError.mapError("Failed to launch the editor sidecar.", 500)
  );

/**
 * Launch the editor control plane and keep it alive until interrupted.
 *
 * @param config - Startup configuration for the editor sidecar runtime.
 * @returns An Effect that runs the editor sidecar until shutdown is requested.
 *
 * @example
 * ```ts
 * import { EditorRuntimeConfig, runEditorRuntime } from "@beep/editor-runtime"
 * import { FilePath, NonNegativeInt } from "@beep/schema"
 *
 * const runtime = runEditorRuntime(
 *   new EditorRuntimeConfig({
 *     host: "127.0.0.1",
 *     port: NonNegativeInt.make(8789),
 *     appDataDir: FilePath.make("/tmp/beep-editor"),
 *     sessionId: "editor-session",
 *     version: "0.0.0",
 *   })
 * )
 * void runtime
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const runEditorRuntime = Effect.fn("EditorRuntime.run")(function* (config: EditorRuntimeConfig) {
  const startedAt = yield* DateTime.now;
  const shutdownRequested = yield* Ref.make(false);
  const shutdownDeferred = yield* Deferred.make<void>();

  const requestShutdown = Effect.fn("EditorRuntime.requestShutdown")(function* () {
    const alreadyRequested = yield* Ref.getAndSet(shutdownRequested, true);

    if (alreadyRequested) {
      return;
    }

    yield* Deferred.succeed(shutdownDeferred, void 0).pipe(Effect.ignore);
  });
  const services = yield* Effect.context<never>();
  const runRequestShutdown = Effect.runForkWith(services);

  yield* Effect.acquireRelease(
    Effect.sync(() => {
      const handleSignal = () => {
        void runRequestShutdown(requestShutdown());
      };

      process.on("SIGINT", handleSignal);
      process.on("SIGTERM", handleSignal);

      return handleSignal;
    }),
    (handleSignal) =>
      Effect.sync(() => {
        process.off("SIGINT", handleSignal);
        process.off("SIGTERM", handleSignal);
      })
  );

  const serverFiber = yield* launchEditorSidecar(config, startedAt).pipe(Effect.forkScoped);

  yield* emitBootstrapStdoutLine(config, startedAt);
  yield* Effect.raceFirst(Deferred.await(shutdownDeferred), Fiber.await(serverFiber).pipe(Effect.asVoid));
  yield* Fiber.interrupt(serverFiber);
});

/**
 * Load editor runtime configuration from the process environment.
 *
 * @returns An Effect that resolves with the decoded runtime configuration.
 *
 * @example
 * ```ts
 * import { loadEditorRuntimeConfig } from "@beep/editor-runtime"
 *
 * const config = loadEditorRuntimeConfig()
 * void config
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadEditorRuntimeConfig = Effect.fn("EditorRuntime.loadConfig")(function* () {
  const path = yield* Path.Path;
  const host = yield* Config.string("BEEP_EDITOR_HOST").pipe(Config.withDefault(defaultHost));
  const port = yield* Config.number("BEEP_EDITOR_PORT").pipe(
    Config.orElse(() => Config.number("PORT")),
    Config.withDefault(defaultPort)
  );
  const appDataDirInput = yield* Config.option(Config.string("BEEP_EDITOR_APP_DATA_DIR"));
  const sessionIdOption = yield* Config.option(Config.string("BEEP_EDITOR_SESSION_ID"));
  const sessionId = yield* O.match(sessionIdOption, {
    onNone: () => DateTime.now.pipe(Effect.map((now) => `editor-sidecar-${DateTime.toEpochMillis(now)}`)),
    onSome: Effect.succeed,
  });
  const version = yield* Config.string("BEEP_EDITOR_VERSION").pipe(Config.withDefault(defaultVersion));
  const appDataDir = yield* O.match(appDataDirInput, {
    onNone: () => Effect.succeed(path.resolve(process.cwd(), defaultAppDataDir)),
    onSome: (value) => Effect.succeed(path.resolve(value)),
  });

  return new EditorRuntimeConfig({
    host,
    port: SidecarPort.make(port),
    appDataDir: FilePath.make(appDataDir),
    sessionId,
    version,
  });
});
