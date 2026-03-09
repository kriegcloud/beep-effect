"use client"

import { KeyValueStore } from "@effect/platform/KeyValueStore"
import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Effect } from "effect"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { GITHUB_REPO_URL } from "@/constants/urls"
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx"
import { AnsiText } from "./ansi"
import { runCliCommand } from "./commands"
import { INITIALIZED_KEY, STORAGE_KEY } from "./services"
import { findWordBoundary, getAutocomplete, type HistoryEntry, nbsp, PLACEHOLDER_HINTS } from "./utils"

const TERMINAL_SOURCE_URL = `${GITHUB_REPO_URL}/blob/main/packages/website/src/components/mdx/Terminal/domain.ts`

// =============================================================================
// Component
// =============================================================================

const blinkStyle = {
  animation: "blink 1s step-end infinite",
} as const

export function TerminalDemo() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState("")
  const [cursorPos, setCursorPos] = useState(0)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [hintIndex, setHintIndex] = useState(0)
  const [blinkKey, setBlinkKey] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { handleHover, handleClick: playClickSfx } = useLessonSfxHandlers()

  // Cycle through placeholder hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % PLACEHOLDER_HINTS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const syncCursor = useCallback(() => {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart ?? input.length)
    }
  }, [input.length])

  const resetBlink = useCallback(() => {
    setBlinkKey((k) => k + 1)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (isRunning) return

      const fullCommand = `tasks ${input}`.trim()
      setIsRunning(true)

      try {
        const result = await runCliCommand(input)
        setHistory((h) => [...h, { input: fullCommand, ...result }])
      } catch (err) {
        setHistory((h) => [...h, { input: fullCommand, output: String(err), isError: true }])
      }

      if (input.trim()) {
        setCommandHistory((h) => [...h, input])
      }
      setHistoryIndex(-1)
      setInput("")
      setCursorPos(0)
      setIsRunning(false)
      // Refocus after React re-renders with disabled=false
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [input, isRunning],
  )

  const cursorAtEnd = cursorPos >= input.length
  const autocomplete = getAutocomplete(input, cursorAtEnd)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const inp = inputRef.current
      if (!inp) return

      if (e.ctrlKey && e.key === "c") {
        e.preventDefault()
        if (input) {
          setHistory((h) => [...h, { input: `tasks ${input}^C`, output: "" }])
          setInput("")
          setCursorPos(0)
        }
        resetBlink()
        return
      }
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault()
        setHistory([])
        return
      }
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault()
        inp.setSelectionRange(0, 0)
        setCursorPos(0)
        resetBlink()
        return
      }
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault()
        inp.setSelectionRange(input.length, input.length)
        setCursorPos(input.length)
        resetBlink()
        return
      }
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault()
        const pos = inp.selectionStart ?? input.length
        const newPos = findWordBoundary(input, pos, "left")
        const newInput = input.slice(0, newPos) + input.slice(pos)
        setInput(newInput)
        setCursorPos(newPos)
        setTimeout(() => inp.setSelectionRange(newPos, newPos), 0)
        resetBlink()
        return
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        const pos = inp.selectionStart ?? input.length
        const newInput = input.slice(pos)
        setInput(newInput)
        setCursorPos(0)
        setTimeout(() => inp.setSelectionRange(0, 0), 0)
        resetBlink()
        return
      }
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        const pos = inp.selectionStart ?? input.length
        setInput(input.slice(0, pos))
        resetBlink()
        return
      }
      if (e.metaKey && e.key === "Backspace") {
        e.preventDefault()
        setInput("")
        setCursorPos(0)
        resetBlink()
        return
      }
      if (e.altKey && e.key === "Backspace") {
        e.preventDefault()
        const pos = inp.selectionStart ?? input.length
        const newPos = findWordBoundary(input, pos, "left")
        const newInput = input.slice(0, newPos) + input.slice(pos)
        setInput(newInput)
        setCursorPos(newPos)
        setTimeout(() => inp.setSelectionRange(newPos, newPos), 0)
        resetBlink()
        return
      }
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault()
        const pos = inp.selectionStart ?? 0
        const newPos = findWordBoundary(input, pos, "left")
        inp.setSelectionRange(newPos, newPos)
        setCursorPos(newPos)
        resetBlink()
        return
      }
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault()
        const pos = inp.selectionStart ?? input.length
        const newPos = findWordBoundary(input, pos, "right")
        inp.setSelectionRange(newPos, newPos)
        setCursorPos(newPos)
        resetBlink()
        return
      }
      if (e.metaKey && e.key === "ArrowLeft") {
        e.preventDefault()
        inp.setSelectionRange(0, 0)
        setCursorPos(0)
        resetBlink()
        return
      }
      if (e.metaKey && e.key === "ArrowRight") {
        e.preventDefault()
        inp.setSelectionRange(input.length, input.length)
        setCursorPos(input.length)
        resetBlink()
        return
      }
      if (e.key === "Tab") {
        e.preventDefault()
        if (autocomplete) {
          const newInput = input + autocomplete
          setInput(newInput)
          setCursorPos(newInput.length)
          setTimeout(() => inp.setSelectionRange(newInput.length, newInput.length), 0)
        }
        resetBlink()
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        const newIndex = historyIndex + 1
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex)
          const cmd = commandHistory[commandHistory.length - 1 - newIndex] ?? ""
          setInput(cmd)
          setCursorPos(cmd.length)
          setTimeout(() => inp.setSelectionRange(cmd.length, cmd.length), 0)
        }
        resetBlink()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const newIndex = historyIndex - 1
        if (newIndex >= 0) {
          setHistoryIndex(newIndex)
          const cmd = commandHistory[commandHistory.length - 1 - newIndex] ?? ""
          setInput(cmd)
          setCursorPos(cmd.length)
          setTimeout(() => inp.setSelectionRange(cmd.length, cmd.length), 0)
        } else {
          setHistoryIndex(-1)
          setInput("")
          setCursorPos(0)
        }
        resetBlink()
        return
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        resetBlink()
        setTimeout(syncCursor, 0)
        return
      }
      resetBlink()
    },
    [historyIndex, commandHistory, input, autocomplete, syncCursor, resetBlink],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value)
      syncCursor()
    },
    [syncCursor],
  )

  const handleInputClick = useCallback(() => {
    syncCursor()
    setBlinkKey((k) => k + 1)
  }, [syncCursor])

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on history change
  useEffect(() => {
    requestAnimationFrame(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    })
  }, [history])

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      playClickSfx()
      setHistory([])
      // Clear storage via KeyValueStore
      Effect.gen(function* () {
        const kv = yield* KeyValueStore
        yield* kv.remove(STORAGE_KEY)
        yield* kv.remove(INITIALIZED_KEY)
      }).pipe(Effect.provide(BrowserKeyValueStore.layerLocalStorage), Effect.runPromise)
    },
    [playClickSfx],
  )

  const beforeCursor = input.slice(0, cursorPos)
  const afterCursor = input.slice(cursorPos)

  return (
    <>
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: focus delegation */}
      <div
        className="not-prose my-6 border-y border-neutral-800 bg-neutral-950 font-mono text-sm"
        onClick={handleContainerClick}
        onKeyDown={undefined}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
          <span className="text-neutral-500">Task Manager</span>
          <div className="flex items-center gap-3">
            <a
              href={TERMINAL_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation()
                playClickSfx()
              }}
              onMouseEnter={handleHover}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Source
            </a>
            <button
              type="button"
              onClick={handleReset}
              onMouseEnter={handleHover}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div ref={outputRef} className="h-72 overflow-y-auto">
          {history.map((entry, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
            <div key={i}>
              {i > 0 && <div className="border-t border-neutral-800/50" />}
              <div className="px-4 py-3">
                <div className="text-green-500">{entry.input}</div>
                {entry.output && (
                  <div className={`whitespace-pre-wrap mt-1 ${entry.isError ? "text-red-400" : "text-neutral-400"}`}>
                    <AnsiText text={entry.output} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {history.length > 0 && <div className="border-t border-neutral-800/50" />}

          <form onSubmit={handleSubmit} className="relative px-4 py-3">
            <div className="flex items-center">
              <span className="text-neutral-500">tasks&nbsp;</span>
              {input ? (
                <span className="relative">
                  <span className="text-green-500">{nbsp(beforeCursor)}</span>
                  {isFocused && (
                    <span key={blinkKey} className="absolute top-0 bottom-0 w-0.5 bg-green-500" style={blinkStyle} />
                  )}
                  <span className="text-green-500">{nbsp(afterCursor)}</span>
                  {cursorAtEnd && <span className="text-neutral-600">{autocomplete}</span>}
                </span>
              ) : (
                <span className="relative">
                  {isFocused && (
                    <span
                      key={blinkKey}
                      className="absolute top-0 bottom-0 left-0 w-0.5 bg-green-500"
                      style={blinkStyle}
                    />
                  )}
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={hintIndex}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-neutral-600 whitespace-nowrap pointer-events-none"
                    >
                      {PLACEHOLDER_HINTS[hintIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onSelect={syncCursor}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 opacity-0 w-full cursor-text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={isRunning}
            />
          </form>
        </div>
      </div>
    </>
  )
}
