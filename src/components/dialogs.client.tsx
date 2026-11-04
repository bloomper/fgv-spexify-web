"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmOptions = {
  title: string;
  description?: string;
  /** Defaults to "Confirm". */
  confirmLabel?: string;
  /** Red confirm button, for what cannot be undone. */
  destructive?: boolean;
};

type PromptOptions = {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
  maxLength?: number;
};

type Request =
  | { type: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { type: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

type Dialogs = {
  /** Resolves with true when confirmed, false when cancelled. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Resolves with the trimmed text, or null when cancelled or left empty. */
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const DialogsContext = createContext<Dialogs | null>(null);

/**
 * In-app replacements for window.confirm and window.prompt, styled like the rest of the application. One dialog at a
 * time; asking again while one is open cancels the first.
 */
export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Common");
  const [request, setRequest] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const current = useRef<Request | null>(null);

  const settle = useCallback((value: boolean | string | null) => {
    const pending = current.current;

    current.current = null;
    setOpen(false);
    if (pending?.type === "confirm") {
      pending.resolve(value === true);
    } else if (pending?.type === "prompt") {
      pending.resolve(typeof value === "string" && value.trim() ? value.trim() : null);
    }
  }, []);

  const ask = useCallback((next: Request) => {
    settle(null);
    current.current = next;
    setText(next.type === "prompt" ? next.options.defaultValue ?? "" : "");
    setRequest(next);
    setOpen(true);
  }, [settle]);

  const dialogs = React.useMemo<Dialogs>(() => ({
    confirm: options => new Promise(resolve => ask({ type: "confirm", options, resolve })),
    prompt: options => new Promise(resolve => ask({ type: "prompt", options, resolve })),
  }), [ask]);

  return (
    <DialogsContext.Provider value={dialogs}>
      {children}
      <Dialog open={open} onOpenChange={next => !next && settle(null)}>
        {request && (
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <form className="grid gap-4" onSubmit={event => {
              event.preventDefault();
              settle(request.type === "prompt" ? text : true);
            }}>
              <DialogHeader>
                <DialogTitle>{request.options.title}</DialogTitle>
                {request.type === "confirm" && request.options.description && (
                  <DialogDescription>{request.options.description}</DialogDescription>
                )}
              </DialogHeader>
              {request.type === "prompt" && (
                <div className="space-y-1.5">
                  <Label htmlFor="dialog-prompt">{request.options.label}</Label>
                  <Input id="dialog-prompt" autoFocus value={text} maxLength={request.options.maxLength}
                         onChange={event => setText(event.target.value)} />
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => settle(null)}>{t("cancel")}</Button>
                <Button type="submit"
                        variant={request.type === "confirm" && request.options.destructive ? "destructive" : "default"}
                        disabled={request.type === "prompt" && !text.trim()}
                        autoFocus={request.type === "confirm"}>
                  {request.options.confirmLabel ?? t("confirm")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </DialogsContext.Provider>
  );
}

export function useDialogs(): Dialogs {
  const dialogs = useContext(DialogsContext);

  if (!dialogs) {
    throw new Error("useDialogs must be used inside DialogsProvider");
  }
  return dialogs;
}
