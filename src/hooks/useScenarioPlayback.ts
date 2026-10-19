import { useCallback, useEffect, useMemo, useState } from 'react';
import { AssessmentTimelineEvent } from '../types/assessment/evidence';

/** Deterministic, condition-agnostic event playback for research/training scenarios. */
export const useScenarioPlayback = <TDomain extends string>(scenarioId: string, events: readonly AssessmentTimelineEvent<TDomain>[]) => {
  const orderedEvents = useMemo(() => [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id)), [events]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastIndex = Math.max(0, orderedEvents.length - 1);

  useEffect(() => { setStepIndex(0); setIsPlaying(false); }, [scenarioId]);
  useEffect(() => {
    if (!isPlaying || stepIndex >= lastIndex) return;
    const timer = window.setInterval(() => setStepIndex((current) => Math.min(lastIndex, current + 1)), 1500);
    return () => window.clearInterval(timer);
  }, [isPlaying, stepIndex, lastIndex]);
  useEffect(() => { if (stepIndex >= lastIndex) setIsPlaying(false); }, [stepIndex, lastIndex]);

  const next = useCallback(() => setStepIndex((current) => Math.min(lastIndex, current + 1)), [lastIndex]);
  const previous = useCallback(() => setStepIndex((current) => Math.max(0, current - 1)), []);
  const reset = useCallback(() => { setStepIndex(0); setIsPlaying(false); }, []);
  const togglePlaying = useCallback(() => setIsPlaying((value) => !value), []);
  const currentEvent = orderedEvents[stepIndex];

  return {
    isPlaying, stepIndex, stepCount: orderedEvents.length, currentEvent,
    visibleEvents: orderedEvents.slice(0, stepIndex + 1),
    visibleEvidenceIds: new Set(orderedEvents.slice(0, stepIndex + 1).flatMap((event) => event.evidenceIds)),
    next, previous, reset, togglePlaying,
    canGoNext: stepIndex < lastIndex, canGoPrevious: stepIndex > 0,
  };
};
