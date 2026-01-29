"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import { ScrollArea } from "@beep/todox/components/ui/scroll-area";
import { cn } from "@beep/todox/lib/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Order from "effect/Order";
import * as React from "react";
import type { EvidenceSpan } from "../types";

interface SourceTextPanelProps {
  sourceText: string;
  highlightedSpans?:  undefined | readonly EvidenceSpan[];
  activeSpanIndex?:  undefined | number;
}

interface TextSegment {
  text: string;
  isHighlighted: boolean;
  spanIndex?:  undefined | number;
}

const segmentText = (text: string, spans: readonly EvidenceSpan[]): TextSegment[] => {
  if (A.isEmptyReadonlyArray(spans)) {
    return [{ text, isHighlighted: false }];
  }

  const sortedSpans = F.pipe(spans, A.sortBy(Order.mapInput(Order.number, (s: EvidenceSpan) => s.startChar)));

  const segments: TextSegment[] = [];
  let currentPos = 0;

  A.forEach(sortedSpans, (span, index) => {
    if (span.startChar > currentPos) {
      segments.push({
        text: text.slice(currentPos, span.startChar),
        isHighlighted: false,
      });
    }

    segments.push({
      text: text.slice(span.startChar, span.endChar),
      isHighlighted: true,
      spanIndex: index,
    });

    currentPos = span.endChar;
  });

  if (currentPos < text.length) {
    segments.push({
      text: text.slice(currentPos),
      isHighlighted: false,
    });
  }

  return segments;
};

export function SourceTextPanel({ sourceText, highlightedSpans, activeSpanIndex }: SourceTextPanelProps) {
  const activeSpanRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());

  React.useEffect(() => {
    if (activeSpanIndex !== undefined) {
      const spanEl = activeSpanRefs.current.get(activeSpanIndex);
      spanEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSpanIndex]);

  const segments = React.useMemo(() => segmentText(sourceText, highlightedSpans ?? []), [sourceText, highlightedSpans]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Source Text</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <pre className="font-mono text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg">
            {A.map(segments, (segment, i) =>
              segment.isHighlighted ? (
                <span
                  key={i}
                  ref={(el) => {
                    if (el && segment.spanIndex !== undefined) {
                      activeSpanRefs.current.set(segment.spanIndex, el);
                    }
                  }}
                  className={cn(
                    "bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5",
                    segment.spanIndex === activeSpanIndex && "ring-2 ring-primary"
                  )}
                >
                  {segment.text}
                </span>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            )}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
