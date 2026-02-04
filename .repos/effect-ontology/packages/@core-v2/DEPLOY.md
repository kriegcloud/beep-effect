# @core-v2 Deployment Guide

**Version**: 2.0.0
**Status**: MVP Ready (E2E tested 2025-12-10)

---

## Quick Start

### Local Development

```bash
# 1. Install dependencies
cd packages/@core-v2
bun install

# 2. Create .env file (copy from template)
cp .env.example .env

# 3. Add your API key
echo "ANTHROPIC_API_KEY=your-key-here" >> .env

# 4. Run extraction (CLI mode)
bun --env-file=.env run src/main.ts

# 5. Start HTTP server
bun --env-file=.env run src/server.ts
```

### Docker Deployment

```bash
# Build image (from repo root)
docker build -f packages/@core-v2/Dockerfile -t effect-ontology:latest .

# Run container
docker run -d \
  --name effect-ontology \
  -p 8080:8080 \
  -e ANTHROPIC_API_KEY=your-key-here \
  -e ONTOLOGY_PATH=/app/ontologies/football/ontology.ttl \
  effect-ontology:latest

# Check health
curl http://localhost:8080/health/live
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | `sk-ant-api03-...` |

Or one of:
| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### LLM Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `anthropic` | LLM provider: `anthropic`, `openai`, `google` |
| `LLM_MODEL` | `claude-haiku-4-5` | Model name |
| `LLM_TIMEOUT_MS` | `60000` | Request timeout in milliseconds |
| `LLM_MAX_TOKENS` | `4096` | Maximum output tokens |
| `LLM_TEMPERATURE` | `0.1` | Model temperature (0.0-1.0) |

### Ontology Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ONTOLOGY_PATH` | `/Users/pooks/.../ontology_skos.ttl` | Path to ontology file |
| `ONTOLOGY_CACHE_TTL` | `3600` | Cache TTL in seconds |

### Runtime Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `EXTRACTION_CONCURRENCY` | `8` | Parallel chunk processing |
| `RETRY_MAX_ATTEMPTS` | `8` | Max retry attempts for API calls |
| `RETRY_INITIAL_DELAY_MS` | `3000` | Initial backoff delay |
| `RETRY_MAX_DELAY_MS` | `30000` | Max backoff delay |

### Grounder Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GROUNDER_ENABLED` | `true` | Enable relation grounding |
| `GROUNDER_CONFIDENCE_THRESHOLD` | `0.8` | Min confidence for verification |
| `GROUNDER_BATCH_SIZE` | `5` | Batch size for grouped verification |

### RDF Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RDF_BASE_NAMESPACE` | `http://example.org/kg/` | Base namespace for RDF |
| `RDF_OUTPUT_FORMAT` | `Turtle` | Output format: `Turtle`, `N-Triples`, `JSON-LD` |

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `NODE_ENV` | `production` | Environment mode |

---

## API Endpoints

### Extraction API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/extract` | Submit extraction job |
| `GET` | `/api/v1/extract/:jobId` | Get job status |
| `GET` | `/api/v1/extract/:jobId/stream` | WebSocket stream (TODO) |

### Health Checks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health/live` | Liveness probe (always 200) |
| `GET` | `/health/ready` | Readiness probe (checks dependencies) |
| `GET` | `/health/deep` | Deep health check (all subsystems) |

### Submit Job Request

```json
{
  "text": "The article text to extract entities from...",
  "config": {
    "maxChunkSize": 500,
    "preserveSentences": true
  }
}
```

### Job Status Response

```json
{
  "jobId": "uuid",
  "status": "pending" | "running" | "completed" | "failed",
  "submittedAt": "2025-12-10T12:00:00Z",
  "completedAt": "2025-12-10T12:00:05Z",
  "progress": {
    "chunksTotal": 3,
    "chunksProcessed": 3,
    "entitiesExtracted": 12,
    "relationsExtracted": 16
  }
}
```

---

## Cloud Deployment

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/effect-ontology

# Deploy
gcloud run deploy effect-ontology \
  --image gcr.io/PROJECT_ID/effect-ontology \
  --platform managed \
  --region us-central1 \
  --set-env-vars "ANTHROPIC_API_KEY=your-key" \
  --set-env-vars "ONTOLOGY_PATH=/app/ontologies/football/ontology.ttl" \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10
```

### Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: effect-ontology
spec:
  replicas: 3
  selector:
    matchLabels:
      app: effect-ontology
  template:
    metadata:
      labels:
        app: effect-ontology
    spec:
      containers:
      - name: effect-ontology
        image: effect-ontology:latest
        ports:
        - containerPort: 8080
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: anthropic-api-key
        - name: ONTOLOGY_PATH
          value: "/app/ontologies/football/ontology.ttl"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: effect-ontology
spec:
  selector:
    app: effect-ontology
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

---

## Output Structure

Extraction results are saved to `./output/runs/{runId}/`:

```
./output/runs/doc-abc123/
├── knowledge-graph.json      # Refined entities and relations
├── entity-resolution-graph.json  # Clustering/dedup info
├── mermaid-diagram.md        # Visual graph representation
└── rdf-turtle.ttl            # RDF Turtle serialization
```

### Run ID

Run IDs are deterministic based on input text hash:
- Same text = same run ID = idempotent results
- Format: `doc-{12-char-hash}`

---

## Extraction Pipeline

The full extraction pipeline consists of 6 phases:

1. **Chunking** - Split text into processable chunks (500 tokens default)
2. **Mention Extraction** - Identify named entity mentions per chunk
3. **Entity Extraction** - Type mentions against ontology classes
4. **Relation Extraction** - Extract relationships using ontology properties
5. **Entity Resolution** - Cluster and deduplicate entities across chunks
6. **RDF Serialization** - Output as Turtle/N-Triples/JSON-LD

### Tested Performance (E2E 2025-12-10)

- Input: 500-word article about Dutch football
- Entities: 12 extracted → 9 resolved (3 clusters merged)
- Relations: 16 extracted → 14 refined
- Time: ~15 seconds (with Claude Haiku)

---

## Monitoring

### Logs

Server logs extraction progress and errors:

```
Effect Logger: extraction started
Effect Logger: chunk 1/3 complete (4 entities, 6 relations)
Effect Logger: extraction complete in 12.3s
```

### Metrics (TODO)

Prometheus metrics endpoint planned at `/metrics`:
- `extraction_jobs_total` - Total jobs submitted
- `extraction_duration_seconds` - Job duration histogram
- `extraction_entities_total` - Entities extracted
- `llm_requests_total` - LLM API calls

---

## Known Limitations (MVP)

1. **In-memory job storage** - Jobs lost on restart
2. **URL fetching stub** - Only inline text supported
3. **No WebSocket streaming** - Polling only
4. **Single ontology** - Hardcoded football ontology path

See `docs/README.md` for persistence roadmap and Phase 2 plans.

---

## Troubleshooting

### "Service not found: @effect/ai/LanguageModel"

LLM layer not provided. Check API key is set:
```bash
echo $ANTHROPIC_API_KEY
```

### "0 entities extracted"

Check ontology path is valid:
```bash
ls $ONTOLOGY_PATH
```

### Rate limit errors

Reduce concurrency:
```bash
EXTRACTION_CONCURRENCY=2 bun run src/main.ts
```

### Connection timeout

Increase timeout:
```bash
LLM_TIMEOUT_MS=120000 bun run src/main.ts
```

---

## Files

| File | Purpose |
|------|---------|
| `src/main.ts` | CLI extraction entry point |
| `src/server.ts` | HTTP server entry point |
| `Dockerfile` | Multi-stage Docker build |
| `.env.example` | Environment template |
| `docs/README.md` | Persistence design docs |

---

**Last Updated**: 2025-12-10
**Tested With**: Anthropic Claude Haiku, Bun 1.2.23
