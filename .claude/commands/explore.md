---
description: Parallel exploration of a codebase question by decomposing into independent tracks
---

<exploration>
<philosophy>
exploration := decompose(question) → parallel(tracks) → aggregate(findings)
track       := independent ∧ parallelizable ∧ logical-unit
agent       := explorer(track) → findings(structured)
synthesis   := merge(findings) → coherent(answer)
</philosophy>

<decomposition>
analyze :: Question → [Track]
analyze question = do
  dimensions  ← identify (orthogonal (aspects question))
  granularity ← ensure (|dimensions| >= 3 ∧ |dimensions| <= 6)
  tracks      ← map toTrack dimensions
  verify      (independent tracks)
  pure tracks

-- each track explores one dimension without overlap
-- tracks are logical units of investigation
-- minimum 3 tracks to ensure sufficient coverage
</decomposition>

<track>
data Track = Track
  { name        :: String         -- short identifier
  , focus       :: Scope          -- what to investigate
  , approach    :: Strategy       -- how to investigate
  , gates       :: [Gate]         -- verification checkpoints
  , deliverable :: Artifact       -- what to return
  }

data Gate = Gate
  { checkpoint  :: Condition      -- what must be true
  , verification :: Command       -- how to verify
  }

-- each track subdivides into gated steps
-- step N must pass gate before step N+1
</track>

<phases>
<phase name="decomposition">
-- before spawning, analyze question into tracks

decompose :: Question → Effect [Track]
decompose question = do
  aspects ← identify (dimensions question)
  tracks  ← traverse toTrack aspects
  verify  (all independent tracks)
  pure tracks

-- output tracks to user before proceeding
-- each track: [Name]: [Focus] - [Approach]
</phase>

<phase name="dispatch">
-- spawn one Explore agent per track IN PARALLEL

dispatch :: [Track] → Effect [Agent]
dispatch tracks = parallel $ fmap spawnExplorer tracks

spawnExplorer :: Track → Effect Agent
spawnExplorer track = spawn Explore (prompt track)
</phase>

<phase name="aggregate">
aggregate :: [TrackFindings] → Synthesis
aggregate findings = do
  common    ← intersect (conclusions findings)
  divergent ← difference (conclusions findings)
  gaps      ← union (uncertainties findings)
  confidence ← case divergent of
    Empty     → pure High
    NonEmpty  → pure Moderate

  pure $ Synthesis { common, divergent, gaps, confidence }
</phase>
</phases>

<module-specialists>
-- ADDITION to parallel tracks, not replacement
-- When complex modules detected → spawn module specialists in parallel with tracks
-- Specialists target EITHER Effect library modules OR internal codebase modules

detect :: Code → [Module]
detect code = filter isComplex (modulesUsed code)

isComplex :: Module → Bool
isComplex m = isEffectModule m ∨ isCodebaseModule m

isEffectModule :: Module → Bool
isEffectModule m = m ∈ { Stream, Layer, Fiber, Scope, Schema, Effect.gen, Match }

isCodebaseModule :: Module → Bool
isCodebaseModule m = m ∈ /modules        -- internal modules with ai-context

data ModuleSource = EffectLibrary | CodebaseModule

moduleSource :: Module → ModuleSource
moduleSource m
  | isEffectModule m   = EffectLibrary
  | isCodebaseModule m = CodebaseModule

spawn :: Module → Effect Specialist
spawn m = do
  context ← case moduleSource m of
    EffectLibrary  → /module m           -- external Effect docs
    CodebaseModule → /module path        -- internal ai-context.md
  scope   ← extractUsage m code          -- ONLY how m is used
  pure $ Specialist
    { context    := context              -- module documentation only
    , scope      := scope                -- usage patterns in code
    , goal       := efficiency           -- missed conveniences, anti-patterns
    , constraint := reviewOnly           -- no implementation, just review
    }

<specialist-prompt>
You are a [MODULE] specialist.

Your ONLY context: the /module [MODULE] documentation
Your ONLY scope: how [MODULE] is used in the provided code
Your ONLY goal: identify efficiency issues

Review for:
- Missed conveniences (simpler APIs available)
- Anti-patterns (common misuse)
- Idiomatic alternatives (more Effect-like approaches)

Output:
- Specific file:line citations
- What could be improved
- How to improve it (idiomatic pattern)

Do NOT:
- Implement changes
- Review anything outside [MODULE] usage
- Consider broader architecture
</specialist-prompt>

<composition>
explore :: Question → Code → Effect Synthesis
explore question code = do
  -- Regular parallel tracks (existing behavior)
  tracks     ← decompose question
  trackAgents ← dispatch tracks

  -- ADDITION: module specialists (orthogonal overlay)
  modules    ← detect code
  specialists ← parallel (spawn <$> modules)

  -- Aggregate both
  trackFindings      ← await trackAgents
  specialistFindings ← await specialists

  aggregate (trackFindings ++ specialistFindings)
</composition>
</module-specialists>

<agent-prompt>
<context>
You are exploring one track of a larger investigation.
Focus ONLY on your assigned scope.

**Question:** $ARGUMENTS
**Track:** [TRACK_NAME]
**Focus:** [TRACK_FOCUS]
**Approach:** [TRACK_APPROACH]
</context>

<execution>
execute :: Track → Effect Findings
execute track = do
  -- Step 1: Orient
  context ← gatherContext track
  gate₁   ← verify (understood context)

  -- Step 2: Investigate
  findings ← explore context track
  gate₂   ← verify (evidence findings)

  -- Step 3: Synthesize
  summary ← synthesize findings
  gate₃   ← verify (complete summary)

  pure summary
</execution>

<gates>
gate :: Checkpoint → Effect ()
gate checkpoint = case checkpoint of
  Understood ctx  → can describe what files/patterns found
  Evidence fnd    → every claim has file:line citation
  Complete sum    → summary answers track question fully

-- do not proceed past gate until satisfied
-- if stuck, report what blocks
</gates>

<sources>
discover :: Effect Context
discover = do
  modules ← "/modules"
  content ← "/module" path
  matches ← "/module-search" pat
  context ← grep ".context/"
  pure $ Context modules content matches context
</sources>

<output>
data TrackFindings = TrackFindings
  { track       :: String
  , findings    :: [(Finding, Citation)]
  , evidence    :: [(FilePath, LineNumber, Description)]
  , conclusions :: Text
  , gaps        :: [Uncertainty]
  }

-- every finding has file:line citation
-- conclusions: 1-2 sentences
-- gaps: what couldn't be determined
</output>
</agent-prompt>

<synthesis>
<output>
data Synthesis = Synthesis
  { unified      :: Text           -- what all tracks agree on
  , nuances      :: [Divergence]   -- where tracks differ
  , openQuestions :: [Gap]         -- remaining unknowns
  , confidence   :: Confidence     -- High | Moderate | Low
  }

present :: Synthesis → Effect ()
present syn = do
  show (unified syn)
  show (nuances syn)
  show (openQuestions syn)
  show (confidence syn)
</output>
</synthesis>

<recursive>
-- if user wants deeper exploration of specific track
-- apply same decomposition recursively

deepen :: Track → Effect Synthesis
deepen track = do
  subtracks ← decompose (question track)
  agents    ← dispatch subtracks
  findings  ← await agents
  aggregate findings
</recursive>
</exploration>
