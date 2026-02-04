# External Ontologies

Bundled reference ontologies for local resolution and version pinning.

## Contents

| File | Ontology | Version | URI |
|------|----------|---------|-----|
| `prov-o.ttl` | W3C PROV-O | 2013-04-30 | http://www.w3.org/ns/prov# |
| `web-annotation.ttl` | W3C Web Annotation | 2017-02-23 | http://www.w3.org/ns/oa# |
| `dcterms.ttl` | Dublin Core Terms | Current | http://purl.org/dc/terms/ |
| `skos.rdf` | SKOS | 2009-08-18 | http://www.w3.org/2004/02/skos/core# |
| `org.ttl` | W3C Organization | 0.8 | http://www.w3.org/ns/org# |
| `owl-time.ttl` | OWL-Time | 2017-04-06 | http://www.w3.org/2006/time# |
| `foaf.ttl` | FOAF (subset) | 0.99-subset | http://xmlns.com/foaf/0.1/ |

## Usage

### OWL Import Resolution

The `catalog.xml` file provides mappings for OWL import resolution. Tools that support XML Catalogs (Protégé, OWL API, Apache Jena) will use these mappings to load local versions instead of fetching from the web.

### OntologyService Integration

The Effect-TS OntologyService can check this directory before fetching remote URIs:

```typescript
const resolveOntologyUri = (uri: string) =>
  Effect.gen(function* () {
    const catalogPath = "ontologies/external/catalog.xml"
    const localPath = yield* checkCatalog(catalogPath, uri)
    if (localPath) return localPath
    return yield* fetchRemote(uri)
  })
```

## Updating Ontologies

To update a bundled ontology:

1. Download the new version
2. Update the filename with version date if changed
3. Update `catalog.xml` mappings
4. Update this README

## Why Bundle Locally?

- **Reproducibility**: Builds don't depend on external availability
- **Version Pinning**: Known, tested versions
- **Performance**: No network latency during development/testing
- **Offline Development**: Works without internet access
