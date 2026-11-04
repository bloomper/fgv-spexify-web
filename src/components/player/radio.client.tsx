"use client";

import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { radioAction } from "@/components/player/actions.server";
import { usePlayer } from "@/components/player/player-provider.client";
import { track as trackEvent } from "@/utils/umami";

/**
 * Starts radio: from a track (which plays first), from an album (other albums' tracks that go with it), or at random.
 */
export function useRadio() {
  const t = useTranslations("Player");
  const player = usePlayer();
  const [pending, startTransition] = useTransition();

  const start = useCallback((seed: { trackId?: string; albumId?: string }) => {
    startTransition(async () => {
      const tracks = await radioAction(seed);

      if (!tracks || tracks.length === 0) {
        toast.error(t(tracks ? "radioEmpty" : "radioFailed"));
        return;
      }
      player.playQueue(tracks, 0);
      trackEvent("radio-start", { seed: seed.trackId ? "track" : seed.albumId ? "album" : "random" });
    });
  }, [player, t]);

  return { start, pending };
}

/**
 * Starts radio with listed tracks at random.
 */
export function RandomRadioButton() {
  const t = useTranslations("Player");
  const radio = useRadio();

  return (
    <Button variant="outline" onClick={() => radio.start({})} disabled={radio.pending}>
      <Radio />{t("randomRadio")}
    </Button>
  );
}
