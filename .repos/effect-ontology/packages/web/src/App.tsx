import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { AppShell } from "./components/AppShell"
import { TimelinePage } from "./pages/TimelinePage"
import { OntologyIndex } from "./pages/OntologyIndex"
import { OntologyPage } from "./pages/OntologyPage"
import { OntologiesPage } from "./pages/OntologiesPage"
import { OntologySchemaPage } from "./pages/OntologySchemaPage"
import { DocumentsPage } from "./pages/DocumentsPage"
import { DocumentDetailPage } from "./pages/DocumentDetailPage"
import { LinksPage } from "./pages/LinksPage"
import { LinkDetailPage } from "./pages/LinkDetailPage"
import { IngestPage } from "./pages/IngestPage"
import { BatchMonitor } from "./pages/BatchMonitor"

export function App() {
  return (
    <>
      <AppShell>
        <Routes>
          {/* Default redirect to ontology selector */}
          <Route path="/" element={<Navigate to="/ontologies" replace />} />

          {/* Ontology registry (pick ontology) */}
          <Route path="/ontologies" element={<OntologiesPage />} />

          {/* Ontology-scoped routes */}
          <Route path="/o/:ontologyId" element={<OntologyIndex />} />
          <Route path="/o/:ontologyId/entities" element={<OntologyIndex />} />
          <Route path="/o/:ontologyId/entities/:entityId" element={<OntologyPage />} />
          <Route path="/o/:ontologyId/links" element={<LinksPage />} />
          <Route path="/o/:ontologyId/links/ingest" element={<IngestPage />} />
          <Route path="/o/:ontologyId/links/:id" element={<LinkDetailPage />} />
          <Route path="/o/:ontologyId/documents" element={<DocumentsPage />} />
          <Route path="/o/:ontologyId/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/o/:ontologyId/timeline" element={<TimelinePage />} />
          <Route path="/o/:ontologyId/classes" element={<OntologySchemaPage />} />
          <Route path="/o/:ontologyId/classes/:iri" element={<OntologySchemaPage />} />
          <Route path="/o/:ontologyId/batches" element={<BatchMonitor />} />

          {/* Legacy route redirects (keep for backwards compatibility) */}
          <Route path="/links" element={<Navigate to="/o/seattle/links" replace />} />
          <Route path="/links/ingest" element={<Navigate to="/o/seattle/links/ingest" replace />} />
          <Route path="/links/:id" element={<Navigate to="/o/seattle/links/:id" replace />} />
          <Route path="/documents" element={<Navigate to="/o/seattle/documents" replace />} />
          <Route path="/documents/:id" element={<Navigate to="/o/seattle/documents/:id" replace />} />
          <Route path="/entities" element={<Navigate to="/o/seattle/entities" replace />} />
          <Route path="/entities/:entityId" element={<Navigate to="/o/seattle/entities/:entityId" replace />} />
          <Route path="/timeline" element={<Navigate to="/o/seattle/timeline" replace />} />
          <Route path="/ontologies/:id" element={<Navigate to="/o/:id/classes" replace />} />

          {/* 404 catch-all */}
          <Route path="*" element={<Navigate to="/ontologies" replace />} />
        </Routes>
      </AppShell>
      <Toaster position="bottom-right" theme="dark" />
    </>
  )
}
