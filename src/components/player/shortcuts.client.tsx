"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlayer } from "@/components/player/player-provider.client";

/** Dispatched on window to show the list of keyboard shortcuts. */
export const SHOW_SHORTCUTS = "spexify:show-shortcuts";

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ["Space", "K"], action: "toggle" },
  { keys: ["←", "→"], action: "seek" },
  { keys: ["Shift + ←", "Shift + →"], action: "skip" },
  { keys: ["+", "−"], action: "volume" },
  { keys: ["M"], action: "mute" },
  { keys: ["S"], action: "shuffle" },
  { keys: ["R"], action: "repeat" },
  { keys: ["?"], action: "help" },
];

/**
 * Whether the focused element uses the key itself: every key while typing, the space key on a button or link, and
 * arrows and the space key on sliders, menus and lists.
 */
export function ownsKeys(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  if (target.closest("input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=''], [contenteditable='true']")) {
    return true;
  }
  if (key === " " && target.closest("button, a, summary, [role='button'], [role='checkbox'], [role='switch'], [role='radio']")) {
    return true;
  }
  return (key === " " || key.startsWith("Arrow"))
    && target.closest("input[type=range], [role='slider'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='radiogroup'], [role='tablist']") !== null;
}

/**
 * The player's keyboard shortcuts, everywhere in the app except where the focused element uses the key itself, and a
 * dialog listing them (the ? key, or the player's menu).
 */
export function PlayerShortcuts() {
  const t = useTranslations("Shortcuts");
  const player = usePlayer();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);

    window.addEventListener(SHOW_SHORTCUTS, show);
    return () => window.removeEventListener(SHOW_SHORTCUTS, show);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || ownsKeys(event.target, event.key)) {
        return;
      }

      const handled = (() => {
        switch (event.key) {
          case "?":
            setOpen(true);
            return true;
          case "+":
          case "=":
            player.setVolume(player.volume + 0.05);
            return true;
          case "-":
          case "_":
            player.setVolume(player.volume - 0.05);
            return true;
          case "m":
          case "M":
            player.toggleMute();
            return true;
        }
        if (!player.current) {
          return false;
        }
        switch (event.key) {
          case " ":
          case "k":
          case "K":
            player.toggle();
            return true;
          case "ArrowLeft":
            if (event.shiftKey) {
              player.previous();
            } else {
              player.seek(Math.max(0, player.time - 10));
            }
            return true;
          case "ArrowRight":
            if (event.shiftKey) {
              player.next();
            } else {
              player.seek(Math.min(player.duration || Infinity, player.time + 10));
            }
            return true;
          case "s":
          case "S":
            player.setShuffle(!player.shuffle);
            return true;
          case "r":
          case "R":
            player.cycleRepeat();
            return true;
          default:
            return false;
        }
      })();

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
          {SHORTCUTS.map(shortcut => (
            <React.Fragment key={shortcut.action}>
              <dt className="flex flex-wrap gap-1">
                {shortcut.keys.map(key => (
                  <kbd key={key} className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{key}</kbd>
                ))}
              </dt>
              <dd>{t(shortcut.action)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
