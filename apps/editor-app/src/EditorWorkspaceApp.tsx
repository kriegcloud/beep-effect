import { EditorClientConfig, type EditorClientShape, makeEditorClient } from "@beep/editor-client";
import { EditorSurface } from "@beep/editor-lexical";
import {
  createPageDocument,
  type EditorPageResource,
  exportPageMimeType,
  makeParagraphBlock,
  PageDocument,
  type PageSummary,
  SidecarBootstrap,
} from "@beep/editor-protocol";
import { NonEmptyTrimmedStr, NonNegativeInt } from "@beep/schema";
import { DateTime, Effect, flow, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { startTransition, useEffect, useState } from "react";
import {
  EditorSidecarState,
  getEditorSidecarState,
  isNativeDesktop,
  startEditorSidecar,
  stopEditorSidecar,
} from "./native.ts";

const browserSessionId = "editor-app-browser";
const decodeNonEmptyTrimmedStr = S.decodeUnknownSync(NonEmptyTrimmedStr);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const defaultErrorMessage = "Editor App could not finish the requested action.";

const makeClientConfig = (baseUrl: string, sessionId: string) =>
  new EditorClientConfig({
    baseUrl,
    sessionId,
  });

const downloadExport = (fileName: string, content: string, mimeType: string): void => {
  if (globalThis.window === undefined) {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = globalThis.window.URL.createObjectURL(blob);
  const anchor = globalThis.window.document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  globalThis.window.URL.revokeObjectURL(url);
};

const errorMessageFromUnknown = (error: unknown): string => {
  if (P.isError(error)) {
    return error.message;
  }

  if (P.isObject(error) && P.hasProperty(error, "message") && P.isString(error.message)) {
    return error.message;
  }

  return defaultErrorMessage;
};

const bootstrapToSidecarState = (
  state: EditorSidecarState | null,
  nextBaseUrl: string,
  sessionId: string
): EditorSidecarState =>
  new EditorSidecarState({
    status: "healthy",
    mode: state === null ? "managed-dev-portless" : state.mode,
    bootstrap: O.some(
      new SidecarBootstrap({
        sessionId,
        host: new URL(nextBaseUrl).hostname,
        port: decodeNonNegativeInt(Number(new URL(nextBaseUrl).port)),
        baseUrl: nextBaseUrl,
        pid: decodeNonNegativeInt(0),
        version: "0.0.0",
        status: "healthy",
        startedAt: DateTime.nowUnsafe(),
      })
    ),
    errorMessage: O.none(),
    stderrTail: state === null ? [] : state.stderrTail,
  });

export function EditorWorkspaceApp() {
  const [client, setClient] = useState<EditorClientShape | null>(null);
  const [sidecarState, setSidecarState] = useState<EditorSidecarState | null>(null);
  const [workspaceName, setWorkspaceName] = useState("Editor Workspace");
  const [pages, setPages] = useState<ReadonlyArray<PageSummary>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePages, setVisiblePages] = useState<ReadonlyArray<PageSummary>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [pageResource, setPageResource] = useState<EditorPageResource | null>(null);
  const [draftPage, setDraftPage] = useState<PageDocument | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [busyState, setBusyState] = useState<"idle" | "connecting" | "loading" | "saving" | "exporting">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectClient = async (config: EditorClientConfig) => {
    setBusyState("connecting");

    try {
      const nextClient = await Effect.runPromise(makeEditorClient(config));
      const workspace = await Effect.runPromise(nextClient.getWorkspace);
      const rootPageSlug = O.getOrNull(workspace.workspace.rootPageSlug);
      const initialSlug =
        rootPageSlug ?? pipe(workspace.pages, A.get(0), O.match({ onNone: () => null, onSome: (page) => page.slug }));

      startTransition(() => {
        setClient(nextClient);
        setWorkspaceName(workspace.workspace.name);
        setPages(workspace.pages);
        setVisiblePages(workspace.pages);
        setErrorMessage(null);
      });

      if (initialSlug !== null) {
        const resource = await Effect.runPromise(nextClient.getPage(initialSlug));

        startTransition(() => {
          setSelectedSlug(initialSlug);
          setPageResource(resource);
          setDraftPage(resource.page);
          setTitleInput(resource.page.title);
        });
      }
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  const refreshWorkspace = async (nextClient: EditorClientShape, slug: string | null) => {
    setBusyState("loading");

    try {
      const workspace = await Effect.runPromise(nextClient.getWorkspace);
      const resolvedSlug =
        slug ??
        O.getOrNull(workspace.workspace.rootPageSlug) ??
        pipe(workspace.pages, A.get(0), O.match({ onNone: () => null, onSome: (page) => page.slug }));

      startTransition(() => {
        setWorkspaceName(workspace.workspace.name);
        setPages(workspace.pages);
      });

      if (resolvedSlug !== null) {
        const resource = await Effect.runPromise(nextClient.getPage(resolvedSlug));

        startTransition(() => {
          setSelectedSlug(resolvedSlug);
          setPageResource(resource);
          setDraftPage(resource.page);
          setTitleInput(resource.page.title);
        });
      }
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  useEffect(() => {
    if (isNativeDesktop()) {
      void (async () => {
        try {
          const bootstrap = await Effect.runPromise(startEditorSidecar());
          const nextState = await Effect.runPromise(getEditorSidecarState());

          startTransition(() => {
            setSidecarState(nextState);
          });

          await connectClient(makeClientConfig(bootstrap.baseUrl, bootstrap.sessionId));
        } catch (error) {
          startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
        }
      })();

      return;
    }

    const browserBaseUrl = globalThis.window === undefined ? null : globalThis.window.location.origin;

    if (browserBaseUrl !== null) {
      const nextState = bootstrapToSidecarState(sidecarState, browserBaseUrl, browserSessionId);

      startTransition(() => {
        setSidecarState(nextState);
      });

      void connectClient(makeClientConfig(browserBaseUrl, browserSessionId));
    }
  }, []);

  useEffect(() => {
    if (client === null) {
      return;
    }

    if (searchQuery === "") {
      startTransition(() => setVisiblePages(pages));
      return;
    }

    void (async () => {
      try {
        const nextResults = await Effect.runPromise(client.searchPages(searchQuery));
        startTransition(() => setVisiblePages(nextResults));
      } catch (error) {
        startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
      }
    })();
  }, [client, pages, searchQuery]);

  const handleSelectPage = async (slug: string) => {
    if (client === null) {
      return;
    }

    setBusyState("loading");

    try {
      const resource = await Effect.runPromise(client.getPage(slug));

      startTransition(() => {
        setSelectedSlug(slug);
        setPageResource(resource);
        setDraftPage(resource.page);
        setTitleInput(resource.page.title);
        setErrorMessage(null);
      });
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  const handleCreatePage = () => {
    const nextTitle = decodeNonEmptyTrimmedStr(`Untitled ${A.length(pages) + 1}`);
    const nextPage = createPageDocument({
      title: nextTitle,
      blocks: [makeParagraphBlock("")],
      now: DateTime.nowUnsafe(),
    });

    startTransition(() => {
      setSelectedSlug(nextPage.slug);
      setPageResource({
        page: nextPage,
        backlinks: [],
      });
      setDraftPage(nextPage);
      setTitleInput(nextPage.title);
      setErrorMessage(null);
    });
  };

  const handleSavePage = async () => {
    if (client === null || draftPage === null) {
      return;
    }

    setBusyState("saving");

    try {
      const nextTitle = decodeNonEmptyTrimmedStr(titleInput);
      const pageToSave = new PageDocument({
        ...draftPage,
        title: nextTitle,
      });
      const resource = await Effect.runPromise(client.savePage(pageToSave));

      startTransition(() => {
        setSelectedSlug(resource.page.slug);
        setPageResource(resource);
        setDraftPage(resource.page);
        setTitleInput(resource.page.title);
        setErrorMessage(null);
      });

      await refreshWorkspace(client, resource.page.slug);
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  const handleExport = async (format: "json" | "markdown") => {
    if (client === null || draftPage === null) {
      return;
    }

    setBusyState("exporting");

    try {
      const exported = await Effect.runPromise(client.exportPage(draftPage.slug, format));
      downloadExport(exported.fileName, exported.content, exportPageMimeType(format));
      startTransition(() => setErrorMessage(null));
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  const handleStopSidecar = async () => {
    if (!isNativeDesktop()) {
      return;
    }

    setBusyState("connecting");

    try {
      await Effect.runPromise(stopEditorSidecar());
      startTransition(() => {
        setSidecarState((current) =>
          current === null
            ? null
            : new EditorSidecarState({
                ...current,
                status: "stopped",
                bootstrap: O.none(),
                errorMessage: O.none(),
              })
        );
      });
    } catch (error) {
      startTransition(() => setErrorMessage(errorMessageFromUnknown(error)));
    } finally {
      setBusyState("idle");
    }
  };

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Editor App</p>
          <h1>Local-first notes with a canonical export spine.</h1>
          <p className="lede">
            The editor shell stays thin while the Effect sidecar owns persistence, search, backlinks, and projections
            into portable formats.
          </p>
        </div>
        <div className="hero-actions">
          <button className="button primary" type="button" onClick={handleCreatePage} disabled={busyState !== "idle"}>
            New page
          </button>
          <button
            className="button"
            type="button"
            onClick={() => void handleSavePage()}
            disabled={busyState !== "idle" || draftPage === null}
          >
            Save
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => void handleExport("markdown")}
            disabled={busyState !== "idle" || draftPage === null}
          >
            Export .md
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => void handleExport("json")}
            disabled={busyState !== "idle" || draftPage === null}
          >
            Export .json
          </button>
          {isNativeDesktop() ? (
            <button
              className="button ghost"
              type="button"
              onClick={() => void handleStopSidecar()}
              disabled={busyState !== "idle"}
            >
              Stop sidecar
            </button>
          ) : null}
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel sidebar">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Workspace</p>
              <h2>{workspaceName}</h2>
            </div>
            <span className={`status-pill status-${sidecarState?.status ?? "starting"}`}>
              {sidecarState?.status ?? "starting"}
            </span>
          </div>
          <label className="search-label">
            <span className="panel-label">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find pages..."
            />
          </label>
          <div className="page-list">
            {pipe(
              visiblePages,
              A.match({
                onEmpty: () => <p className="muted">No pages match the current search.</p>,
                onNonEmpty: flow(
                  A.map((page) => (
                    <button
                      className={`page-card${selectedSlug === page.slug ? " page-card-active" : ""}`}
                      key={page.id}
                      type="button"
                      onClick={() => void handleSelectPage(page.slug)}
                    >
                      <strong>{page.title}</strong>
                      <span>{page.excerpt}</span>
                    </button>
                  ))
                ),
              })
            )}
          </div>
        </section>

        <section className="panel editor-panel">
          {draftPage === null ? (
            <div className="empty-state">
              <p className="panel-label">Editor</p>
              <h2>Select or create a page to begin.</h2>
            </div>
          ) : (
            <>
              <div className="panel-heading">
                <div className="editor-meta">
                  <p className="panel-label">Document</p>
                  <input
                    className="title-input"
                    value={titleInput}
                    onChange={(event) => setTitleInput(event.target.value)}
                    placeholder="Untitled"
                  />
                  <p className="slug-label">slug: {draftPage.slug}</p>
                </div>
                <span className="status-pill status-healthy">{busyState}</span>
              </div>
              <EditorSurface
                key={draftPage.id}
                page={draftPage}
                onChange={(nextPage) => {
                  startTransition(() => {
                    setDraftPage(nextPage);
                  });
                }}
              />
            </>
          )}
        </section>

        <aside className="panel inspector">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Inspector</p>
              <h2>Backlinks and export</h2>
            </div>
          </div>
          <dl className="inspector-grid">
            <div>
              <dt>Pages</dt>
              <dd>{A.length(pages)}</dd>
            </div>
            <div>
              <dt>Backlinks</dt>
              <dd>{pageResource === null ? 0 : A.length(pageResource.backlinks)}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>
                {sidecarState === null
                  ? browserSessionId
                  : O.match(sidecarState.bootstrap, {
                      onNone: () => browserSessionId,
                      onSome: (bootstrap) => bootstrap.sessionId,
                    })}
              </dd>
            </div>
          </dl>
          <div className="backlinks">
            <p className="panel-label">Backlinks</p>
            {pageResource === null || A.length(pageResource.backlinks) === 0 ? (
              <p className="muted">No backlinks yet.</p>
            ) : (
              pipe(
                pageResource.backlinks,
                A.map((page) => (
                  <button
                    key={page.id}
                    className="backlink-item"
                    type="button"
                    onClick={() => void handleSelectPage(page.slug)}
                  >
                    {page.title}
                  </button>
                ))
              )
            )}
          </div>
          {errorMessage === null ? null : <p className="error-banner">{errorMessage}</p>}
        </aside>
      </main>
    </div>
  );
}
