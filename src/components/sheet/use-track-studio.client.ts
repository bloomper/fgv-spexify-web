"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { type TrackStudio, trackStudioAction } from "@/components/sheet/actions.server";

// Fetched once per track and kept for the session, so that opening the player again shows them at once
const cache = new Map<string, TrackStudio | null>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function load(id: string) {
  loading.add(id);
  try {
    cache.set(id, await trackStudioAction(id));
  } catch {
    // Not available now: the player shows no sheet music for the track
    cache.set(id, null);
  } finally {
    loading.delete(id);
    listeners.forEach(listener => listener());
  }
}

/**
 * The playing track's sheet music, score maps and singers. reload() fetches them again, e.g. after an editor saved a
 * map or while an automatic one is being made.
 */
export function useTrackStudio(trackId: string | null | undefined): { studio: TrackStudio | null; reload: () => Promise<void> } {
  const studio = useSyncExternalStore(subscribe, () => (trackId ? cache.get(trackId) ?? null : null), () => null);

  useEffect(() => {
    if (trackId && !cache.has(trackId) && !loading.has(trackId)) {
      void load(trackId);
    }
  }, [trackId]);

  const reload = useCallback(async () => {
    if (trackId) {
      await load(trackId);
    }
  }, [trackId]);

  return { studio, reload };
}

/** For tests. */
export function clearTrackStudios() {
  cache.clear();
  loading.clear();
}
