# seal-rookery  `[T3]`

- **Purpose:** Collection of US court seal images plus a Python package to resolve CourtListener court IDs to hosted seal image URLs.
- **Stack:** Python (enum/pathlib stdlib); packaged via pyproject.toml/uv; image assets (png/svg/ps).
- **Size / shape:** ~279 files (mostly image assets), tiny Python lib (~1 module + seals.json index of 365 courts).
- **License:** unknown
- **Maturity:** Last commit 2025-05-28

**Notes:** Primarily an image asset repo (court seals) from Free Law Project; almost nothing reusable for beep's core proof/provenance/NLP pipeline. Only genuine value is the court-ID to court-name index in seals.json as an enrichment table for the existing CourtListener driver. LICENSE.txt covers images (public domain for US federal works) plus a software section; SPDX id not explicitly stated, marked unknown.

## Gold nuggets (2)

### 1. CourtListener court-ID to full court-name taxonomy
`data-ingestion` · relevance: **adjacent** · verified

seals.json maps 365 CourtListener court IDs (e.g. ca9, akb, acca) to canonical full court names. Useful as a static lookup/enrichment table for beep's existing CourtListener driver and for resolving court identifiers in citations/provenance without an API round-trip. Adjacent because beep already has a CourtListener skeleton, but this name mapping is a ready-made reference dataset.

- **Source:** `seal_rookery/seals/seals.json:1-12`
- **beep-target:** @beep/courtlistener driver (court-ID enrichment table)

```
"acca": {
    "has_seal": true,
    "hash": "73105919687d913e17d9a2eeb267aa5091ad0e97fc9d7bcb6fe32c0d7310014e",
    "name": "United States Army Court of Criminal Appeals",
    "notes": ""
}
```

### 2. Court seal image URL resolver pattern
`desktop-portal` · relevance: **serendipitous** · verified

search.py resolves a court ID + size enum to a hosted seal image URL (seals.free.law), with a typed ImageSizes enum and graceful None fallback. Minor serendipitous value: a UI could display court seals next to matter/citation references in the desktop portal, and the enum-driven size resolution is a clean small pattern.

- **Source:** `seal_rookery/search.py:31-47`
- **beep-target:** desktop portal UI (court seal display)

```
def seal(court: str, size: SIZES = ImageSizes.MEDIUM) -> Optional[str]:
    if court not in seals:
        return None
    if size == ImageSizes.ORIGINAL:
        ...
    else:
        return f"https://seals.free.law/v2/{size.value}/{court}.png"
```
