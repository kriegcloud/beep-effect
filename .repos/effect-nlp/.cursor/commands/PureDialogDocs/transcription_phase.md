## Description

### **Project Description: Expert Knowledge Transcription Pipeline**

#### **Project Overview**

This project aims to develop a specialized data processing pipeline designed to ingest and accurately transcribe **expert-to-expert discussions** from niche, information-dense domains. The primary input is video and audio content, such as industry-specific podcasts and panel interviews, where subject matter experts engage in deep-dive conversations.

The immediate goal is to convert this unstructured conversational data into a meticulously structured, speaker-attributed transcript. This transcript will serve as the foundational, high-fidelity data layer for future knowledge extraction and AI applications.

---

#### **Core Focus: High-Signal, Domain-Specific Dialogue**

The central challenge and core value of this project lie in its exclusive focus on **highly specific professional fields** (e.g., industrial automation, advanced manufacturing, biochemical engineering). Unlike general-purpose transcription services, this pipeline is being built with the understanding that the source material is characterized by:

- **Complex Jargon and Terminology:** The language used is specific to the domain and often unintelligible to a general audience.
- **High Information Density:** Conversations are not casual; they are rich with concepts, problem formulations, and solutions.
- **Implicit Knowledge:** Experts often communicate with a shared, unspoken context.

The system's primary function is to capture this nuanced dialogue with precision, preserving the exact terminology and attributing it to the correct individual—distinguishing between the 'host' guiding the conversation and the 'expert' providing core insights. This initial transcription phase is critical, as the accuracy of all subsequent knowledge graph and ontology creation depends entirely on it.

---

## Domain Model for Interview Transcription (Phase 1)

This revised model focuses exclusively on capturing the source material, defining the transcription task, and structuring the resulting transcript.

### 1\. Core Entities

These are the fundamental data structures representing the people and content.

```typescript
/**
 * A generic structure for web links associated with a speaker or channel.
 */
export interface Link {
  site: string; // e.g., 'LinkedIn', 'Personal Website'
  url: string;
}

/**
 * Defines the role of a speaker in the interview context.
 */
export type SpeakerRole = "host" | "guest";

/**
 * Represents a participant in the interview. A unique ID is crucial for
 * accurately mapping speakers to transcript segments (diarization).
 */
export interface Speaker {
  id: string; // e.g., 'spk_01', 'spk_02'
  name: string;
  role: SpeakerRole;
  // Details below might be populated in a later enrichment phase
  title: string;
  bio?: string;
  education?: string;
  (phd, ms);
  company?: string;
  affiliations?: string;
  nationality?: string;
  links?: Link[];
}
```

---

### 2\. Source & Content Entities

These types describe the source of the media and its metadata.

```typescript
/**
 * Represents the podcast or channel that published the episode.
 */
export interface Channel {
  id: string; // Platform-specific ID (e.g., YouTube Channel ID)
  name: string;
  url: string;
}

/**
 * Represents a single interview episode. This is the central object that
 * will hold all associated information, including the final transcript.
 */
export interface Episode {
  id: string; // The unique ID for the episode (e.g., YouTube Video ID)
  title: string;
  url: string;
  description: string;
  publishDate: Date;
  channel: Channel;
  speakers: Speaker[];
  durationSeconds: number;
  links: Link[];
  // The transcript will be populated after the ExtractionTask is complete
}
```

---

### 3\. Transcription Task & Result Entities

This section defines the job to be done and the structure of its output. This is the core of the initial phase.

```typescript
/**
 * Defines the parameters and metadata for a single transcription job.
 * This object is the primary input to the transcription service.
 */
export interface TranscriptionTask {
  taskId: string; // A unique identifier for this specific job
  episodeId: string; // Links back to the Episode being transcribed
  source: {
    type: "podcast"; // | "lecture" | "panel_discussion"; later additions
    format: "youtube" | "spotify_audio" | "audio_file"; // later additions
    url: string; // The direct URL to the media
  };
  configuration: {
    language: string; // e.g., 'en-US'
    speakerCount: number;
    // Diarization is the process of separating speakers.
    enableDiarization: boolean;
  };
  createdAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

/**
 * A single, timestamped segment of the conversation attributed to a speaker.
 */
export interface TranscriptSegment {
  speakerId: string; // Corresponds to the 'id' in the Speaker interface
  startTime: number; // Start time in seconds (e.g., 932.125)
  endTime: number; // End time in seconds (e.g., 935.500)
  text: string; // The verbatim text spoken in this segment
}

/**
 * The complete transcript result from a successful transcription task.
 */
export interface Transcript {
  segments: TranscriptSegment[];
  processingMetadata: {
    taskId: string; // Link back to the task that generated this
    completedAt: Date;
    processingDurationSeconds: number;
    transcriptionModel: string; // e.g., 'whisper-large-v3'
  };
}
```

## Simplified Production-Ready Architecture Specification

### Core Feature & Use Cases

**Primary Use Case**: Extract structured, verifiable knowledge from YouTube interview videos with exactly 2 speakers in a host-guest relationship, using Gemini 2.0 Flash's native video processing capabilities.

**Key Requirements**:
- Process YouTube links directly through Gemini API (no audio extraction)
- Validate all output against YouTube metadata
- Track every LLM call with full observability
- Prevent duplicate processing
- Stream transcription results

### Domain Entities

```typescript
// Core Value Objects
type VideoId = Brand<string, "VideoId">  // YouTube video ID
type TranscriptId = Brand<string, "TranscriptId">  // UUID v4
type JobId = Brand<string, "JobId">  // Processing job UUID
type UserId = Brand<string, "UserId">  // User identifier

// Speaker Turn - Core unit of transcription
type SpeakerTurn = {
  speaker: "HOST" | "GUEST"  // Fixed roles
  startTime: Seconds         // Must be monotonically increasing
  endTime: Seconds           // Must be > startTime
  text: string              // Actual spoken content
  confidence: number        // 0-1 confidence score from LLM
}

// Video Metadata (from YouTube API)
type VideoMetadata = {
  videoId: VideoId
  title: string
  description: string
  duration: Seconds
  publishedAt: Date
  channelId: string
  channelTitle: string
  thumbnailUrl: string
  viewCount: number
  exists: boolean  // Validation flag
}

// Processing Job
type ProcessingJob = {
  jobId: JobId
  videoId: VideoId
  userId: UserId
  status: JobStatus
  metadata: VideoMetadata
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: ProcessingError
}

type JobStatus = 
  | "PENDING"      // Queued for processing
  | "VALIDATING"   // Checking video exists & meets criteria
  | "EXTRACTING"   // Getting metadata
  | "TRANSCRIBING" // LLM processing
  | "COMPLETED"    // Success
  | "FAILED"       // Terminal failure

// Complete Transcript
type Transcript = {
  transcriptId: TranscriptId
  jobId: JobId
  videoId: VideoId
  metadata: VideoMetadata
  turns: SpeakerTurn[]
  summary: TranscriptSummary
  llmMetrics: LLMMetrics
  validationResults: ValidationResults
  createdAt: Date
}

// Summary extracted from transcript
type TranscriptSummary = {
  hostName?: string
  guestName?: string
  topics: string[]
  keyPoints: string[]
  totalTurns: number
  totalDuration: Seconds
}

// LLM tracking
type LLMMetrics = {
  calls: LLMCall[]
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number  // In cents
  modelVersion: string
}

type LLMCall = {
  timestamp: Date
  operation: "VALIDATE" | "EXTRACT_META" | "TRANSCRIBE"
  inputTokens: number
  outputTokens: number
  latencyMs: number
  cost: number
  success: boolean
  retryCount: number
}

// Validation results
type ValidationResults = {
  durationMatch: boolean  // Transcript duration ~= video duration
  timelineCoherent: boolean  // No overlapping turns
  speakerCount: boolean  // Exactly 2 speakers detected
  confidence: number  // Overall confidence score
}
```

### Service Architecture (2 Services Only)

```typescript
// Service 1: Ingestion Service
// Handles: Link submission, validation, metadata extraction
interface IngestionService {
  // API Endpoints
  POST: "/api/v1/ingest" // Submit YouTube link
  GET: "/api/v1/jobs/:jobId" // Check job status
  GET: "/api/v1/jobs/:jobId/metadata" // Get extracted metadata
  
  // Core Operations
  submitVideo: (url: string, userId: UserId) => Effect<JobId, SubmissionError>
  validateVideo: (videoId: VideoId) => Effect<VideoMetadata, ValidationError>
  checkDuplicate: (videoId: VideoId) => Effect<Option<TranscriptId>, DatabaseError>
  extractMetadata: (videoId: VideoId) => Effect<VideoMetadata, YouTubeError>
  publishToQueue: (job: ProcessingJob) => Effect<void, PubSubError>
}

// Service 2: Transcription Service  
// Handles: Transcription, validation, persistence
interface TranscriptionService {
  // Core Operations
  processJob: (job: ProcessingJob) => Effect<Transcript, TranscriptionError>
  transcribeVideo: (videoId: VideoId) => Stream<SpeakerTurn, GeminiError>
  validateTranscript: (turns: SpeakerTurn[], metadata: VideoMetadata) => ValidationResults
  persistTranscript: (transcript: Transcript) => Effect<void, StorageError>
  streamResults: (jobId: JobId) => Stream<TranscriptionEvent, never>
}
```

### Invariants & Business Rules

```typescript
// Domain Invariants
const invariants = {
  // Temporal coherence
  turnsAreChronological: (turns: SpeakerTurn[]): boolean =>
    turns.every((turn, i) => 
      i === 0 || turn.startTime >= turns[i-1].endTime
    ),
  
  // No overlapping speech
  turnsDoNotOverlap: (turns: SpeakerTurn[]): boolean =>
    turns.every((turn, i) =>
      i === 0 || turn.startTime >= turns[i-1].endTime
    ),
  
  // Duration validation (within 5% tolerance)
  durationMatchesMetadata: (turns: SpeakerTurn[], videoDuration: Seconds): boolean => {
    const transcriptDuration = turns[turns.length - 1]?.endTime || 0
    const tolerance = videoDuration * 0.05
    return Math.abs(transcriptDuration - videoDuration) <= tolerance
  },
  
  // Exactly two speakers
  exactlyTwoSpeakers: (turns: SpeakerTurn[]): boolean => {
    const speakers = new Set(turns.map(t => t.speaker))
    return speakers.size === 2
  },
  
  // Minimum confidence threshold
  confidenceThreshold: (turns: SpeakerTurn[]): boolean =>
    turns.every(turn => turn.confidence >= 0.7)
}
```

### Error Handling

```typescript
// Error hierarchy
type DomainError = 
  | ValidationError
  | TranscriptionError
  | ExternalServiceError
  | QuotaError

type ValidationError = {
  _tag: "ValidationError"
  code: "INVALID_URL" | "NOT_INTERVIEW" | "WRONG_SPEAKER_COUNT" | "VIDEO_TOO_LONG"
  message: string
  videoId?: VideoId
}

type TranscriptionError = {
  _tag: "TranscriptionError"
  code: "GEMINI_ERROR" | "TIMEOUT" | "INVALID_RESPONSE" | "CONFIDENCE_TOO_LOW"
  message: string
  retryable: boolean
  jobId: JobId
}

type ExternalServiceError = {
  _tag: "ExternalServiceError"
  service: "YOUTUBE" | "GEMINI" | "STORAGE"
  statusCode?: number
  message: string
  retryAfter?: Seconds
}

// Error recovery strategies
const errorRecovery = {
  // Retry with exponential backoff for transient errors
  retryStrategy: (error: DomainError): Option<RetryConfig> => {
    switch(error._tag) {
      case "ExternalServiceError":
        return error.statusCode >= 500 
          ? Some({ maxRetries: 3, backoff: "exponential", initialDelay: 1000 })
          : None
      case "TranscriptionError":
        return error.retryable
          ? Some({ maxRetries: 2, backoff: "linear", initialDelay: 5000 })
          : None
      default:
        return None
    }
  },
  
  // Dead letter queue for permanent failures
  shouldDeadLetter: (error: DomainError, retryCount: number): boolean =>
    retryCount >= 3 || 
    (error._tag === "ValidationError") ||
    (error._tag === "TranscriptionError" && !error.retryable)
}
```

### Pub/Sub Configuration

```typescript
// Single topic for job processing
const TOPICS = {
  TRANSCRIPTION_JOBS: 'transcription-jobs-v1',
  DEAD_LETTER: 'transcription-dead-letter-v1'
} as const

// Message schema
type JobMessage = {
  messageId: string
  publishTime: string
  attributes: {
    jobId: string
    videoId: string
    userId: string
    retryCount: string
    priority: "HIGH" | "NORMAL" | "LOW"
  }
  data: ProcessingJob  // Base64 encoded JSON
}

// Subscription configuration
const subscriptionConfig = {
  name: 'transcription-worker',
  topic: TOPICS.TRANSCRIPTION_JOBS,
  ackDeadlineSeconds: 600,  // 10 minutes for long transcriptions
  retryPolicy: {
    minimumBackoff: '10s',
    maximumBackoff: '600s'
  },
  deadLetterPolicy: {
    deadLetterTopic: TOPICS.DEAD_LETTER,
    maxDeliveryAttempts: 5
  },
  maxOutstandingMessages: 5  // Process 5 videos concurrently
}
```

### Storage Schema (Google Drive)

```typescript
// Folder structure
const driveStructure = {
  root: 'transcripts/',
  byDate: 'transcripts/2024/01/15/',
  byVideo: 'transcripts/videos/{videoId}/',
  deduplication: 'transcripts/.dedup/{videoIdHash}'
}

// File formats
type TranscriptFile = {
  filename: `${videoId}_${timestamp}.json`
  content: Transcript
  metadata: {
    jobId: JobId
    processedAt: Date
    version: "1.0.0"
  }
}

type DeduplicationRecord = {
  videoId: VideoId
  transcriptId: TranscriptId
  firstProcessed: Date
  lastAccessed: Date
  accessCount: number
}
```

### Gemini Integration Specification

```typescript
// Gemini 2.0 Flash configuration
type GeminiConfig = {
  model: "gemini-2.0-flash-exp"
  videoProcessing: {
    maxVideoDuration: 3600  // 1 hour max
    supportedFormats: ["youtube"]
  }
  generationConfig: {
    temperature: 0.3  // Low for accuracy
    topK: 40
    topP: 0.95
    maxOutputTokens: 30000
    responseMimeType: "application/json"
  }
  safetySettings: SafetySettings[]
}

// Prompt templates
const PROMPTS = {
  VALIDATE_INTERVIEW: `
    Analyze this YouTube video and determine:
    1. Is this an interview format?
    2. Are there exactly 2 speakers?
    3. Is there a clear host-guest relationship?
    
    Return JSON:
    {
      "isInterview": boolean,
      "speakerCount": number,
      "hasHostGuestFormat": boolean,
      "confidence": number
    }
  `,
  
  TRANSCRIBE_INTERVIEW: `
    Transcribe this interview as speaker turns.
    - Label speakers as "HOST" and "GUEST"
    - Include exact timestamps
    - Preserve natural speech patterns
    
    Return JSON array of:
    {
      "speaker": "HOST" | "GUEST",
      "startTime": number (seconds),
      "endTime": number (seconds),
      "text": string,
      "confidence": number (0-1)
    }
  `
}
```

### Monorepo Structure (Minimal)

```
transcription-platform/
├── packages/
│   ├── domain/              # Shared types & schemas
│   │   ├── src/
│   │   │   ├── entities.ts
│   │   │   ├── errors.ts
│   │   │   └── schemas.ts
│   │   └── package.json
│   │
│   └── gemini/             # Gemini client wrapper
│       ├── src/
│       │   ├── client.ts
│       │   └── prompts.ts
│       └── package.json
│
├── services/
│   ├── ingestion/          # Service 1
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── validation.ts
│   │   │   └── youtube.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── transcription/      # Service 2
│       ├── src/
│       │   ├── processor.ts
│       │   ├── storage.ts
│       │   └── streaming.ts
│       ├── Dockerfile
│       └── package.json
│
├── infrastructure/
│   ├── pubsub-topics.tf
│   ├── cloud-run.tf
│   └── iam.tf
│
├── pnpm-workspace.yaml
└── cloudbuild.yaml
```

### Compliance & Security

```typescript
// Security requirements
const security = {
  // API Authentication
  authentication: "Firebase Auth / Google Identity",
  
  // Rate limiting
  rateLimits: {
    perUser: {
      requests: 100,
      window: "1h"
    },
    perVideo: {
      processes: 1,
      window: "24h"  // Prevent reprocessing same video
    }
  },
  
  // Data retention
  retention: {
    transcripts: "90 days",
    logs: "30 days",
    metrics: "1 year"
  },
  
  // PII handling
  piiHandling: {
    anonymizeLogs: true,
    encryptAtRest: true,
    gdprCompliant: true
  }
}
```

### Observability

```typescript
// Key metrics to track
const metrics = {
  // Business metrics
  "videos.processed": Counter,
  "transcription.duration": Histogram,
  "speaker.turns.count": Histogram,
  
  // Technical metrics  
  "gemini.latency": Histogram,
  "gemini.tokens.used": Counter,
  "gemini.cost": Counter,
  
  // Error metrics
  "validation.failures": Counter,
  "transcription.failures": Counter,
  "quota.exceeded": Counter
}

// Structured logging
type LogEntry = {
  timestamp: Date
  severity: "DEBUG" | "INFO" | "WARN" | "ERROR"
  jobId?: JobId
  videoId?: VideoId
  operation: string
  duration?: number
  error?: Error
  metadata: Record<string, unknown>
}
```

### Implementation Priorities

1. **Phase 1 (MVP)**:
   - Basic ingestion endpoint
   - Gemini integration for 2-speaker interviews
   - Simple file-based deduplication
   - Basic error handling

2. **Phase 2 (Production)**:
   - Streaming transcription results
   - Full observability
   - Rate limiting & quotas
   - Retry logic & dead letter queue

3. **Phase 3 (Scale)**:
   - Quality scoring system
   - Batch processing optimization
   - Advanced deduplication
   - Cost optimization

This simplified architecture focuses on the core value proposition while maintaining production readiness, type safety, and clear boundaries between services.

### Related Specs

- Metadata‑Driven Prompt Optimization: specs/02-metadata-prompt-optimization/instructions.md
- Lightweight NLP for Topic Tags & Channel Context: specs/03-lightweight-nlp-topic-tags/instructions.md
