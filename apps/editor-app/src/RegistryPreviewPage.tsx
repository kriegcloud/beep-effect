/**
 * Registry preview route for app-local MUI Treasury components.
 *
 * @module
 * @since 0.0.0
 */
import { Link } from "@tanstack/react-router";
import { Action, Actions } from "./mui-treasury/components/ai-actions/index.js";
import { Loader } from "./mui-treasury/components/ai-loader/index.js";

const SparkIcon = () => (
  <svg aria-hidden="true" className="registry-icon" fill="none" viewBox="0 0 24 24">
    <path d="M12 3.5L13.9 8.1L18.5 10L13.9 11.9L12 16.5L10.1 11.9L5.5 10L10.1 8.1L12 3.5Z" fill="currentColor" />
  </svg>
);

const LayersIcon = () => (
  <svg aria-hidden="true" className="registry-icon" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 4L20 8L12 12L4 8L12 4ZM6.2 12L12 15L17.8 12M6.2 16L12 19L17.8 16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const LaunchIcon = () => (
  <svg aria-hidden="true" className="registry-icon" fill="none" viewBox="0 0 24 24">
    <path
      d="M8 16L16 8M10 8H16V14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

/**
 * Render the MUI Treasury registry preview page.
 *
 * @example
 * ```tsx
 * import { RegistryPreviewPage } from "@beep/editor-app/RegistryPreviewPage"
 *
 * const Route = () => <RegistryPreviewPage />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function RegistryPreviewPage() {
  return (
    <div className="shell registry-preview-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Registry Preview</p>
          <h1>MUI Treasury rendered inside the editor app.</h1>
          <p className="lede">
            This route validates the shadcn registry wiring by rendering app-local components installed from the MUI
            Treasury registry while still using the shared beep theme provider.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button ghost" to="/">
            Back to editor
          </Link>
          <a className="button primary" href="https://www.mui-treasury.com/" rel="noreferrer" target="_blank">
            Open registry
          </a>
        </div>
      </header>

      <main className="registry-preview-grid">
        <section className="panel registry-showcase">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Installed Items</p>
              <h2>MUI Treasury action bar and loader</h2>
            </div>
            <span className="status-pill status-healthy">verified</span>
          </div>

          <div className="registry-stack">
            <div className="registry-loader-row">
              <Loader color="inherit" />
              <div>
                <strong>Registry component rendered successfully</strong>
                <p className="muted">The loader above is sourced from `@mui-treasury/ai-loader`.</p>
              </div>
            </div>

            <div className="registry-actions-card">
              <p className="panel-label">Quick Actions</p>
              <Actions className="registry-actions">
                <Action label="Generate" tooltip="Generate">
                  <SparkIcon />
                </Action>
                <Action label="Organize" tooltip="Organize">
                  <LayersIcon />
                </Action>
                <Action label="Launch" tooltip="Launch">
                  <LaunchIcon />
                </Action>
              </Actions>
            </div>
          </div>

          <div className="registry-card-grid">
            <article className="registry-card">
              <p className="panel-label">Shared Theme</p>
              <h3>App chrome still comes from `@beep/ui`.</h3>
              <p className="muted">
                The preview route stays inside the existing app shell and color tokens, so registry items blend into the
                rest of the workspace.
              </p>
            </article>
            <article className="registry-card">
              <p className="panel-label">Registry Scope</p>
              <h3>Components installed into the app workspace.</h3>
              <p className="muted">
                The generated files live under `src/mui-treasury/`, which keeps this validation isolated from the shared
                UI package exports.
              </p>
            </article>
          </div>
        </section>

        <aside className="panel registry-sidebar">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Checklist</p>
              <h2>What this proves</h2>
            </div>
          </div>

          <div className="registry-checklist">
            <div className="registry-check">
              <strong>Claude user config includes `shadcn`.</strong>
              <p className="muted">The MCP server is present in `~/.claude.json` under `mcpServers`.</p>
            </div>
            <div className="registry-check">
              <strong>The repo knows the `@mui-treasury` namespace.</strong>
              <p className="muted">
                Both shadcn workspaces point at <code>https://www.mui-treasury.com/r/{"{name}"}.json</code>.
              </p>
            </div>
            <div className="registry-check">
              <strong>The app can install and render registry items.</strong>
              <p className="muted">This page uses the generated loader and action components directly.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
