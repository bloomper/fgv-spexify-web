"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePlayer } from "@/components/player/player-provider.client";

/**
 * Moves repeat on to its next mode and says which: off, all (the whole queue, e.g. the album) and one (the song) look
 * much alike.
 */
export function useCycleRepeat() {
  const t = useTranslations("Player");
  const player = usePlayer();

  return () => {
    const next = player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off";

    player.cycleRepeat();
    toast(t(`repeat.${next}`), { id: "repeat", duration: 1500 });
  };
}
