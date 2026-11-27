"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Spinner } from "@bloomper/fgv-web-ui/ui/spinner";

type PdfDocument = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; canvas: HTMLCanvasElement }) => {
      promise: Promise<void>;
      cancel: () => void;
    };
  }>;
};

// The loading task, not the document, is what pdf.js destroys: it also destroys the document and stops its worker
type PdfLoadingTask = { promise: Promise<PdfDocument>; destroy: () => Promise<void> };

let pdfjs: Promise<{ getDocument: (source: { data: ArrayBuffer }) => PdfLoadingTask }> | null = null;

/** pdf.js, loaded the first time a score is read; its worker is served from this origin. */
function loadPdfJs() {
  pdfjs ??= import("pdfjs-dist").then((module) => {
    module.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    return module as unknown as { getDocument: (source: { data: ArrayBuffer }) => PdfLoadingTask };
  });
  return pdfjs;
}

/**
 * Reads a PDF score page by page, drawn by pdf.js to fit the width, with zoom. Phones need this: Safari shows only the
 * first page of a PDF in a frame. Give it a key per file, so that a new file starts at its first page.
 */
export function PdfReader({ url, title }: { url: string; title: string }) {
  const t = useTranslations("Sheet");
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let dead = false;
    let task: PdfLoadingTask | null = null;

    (async () => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const [library, data] = await Promise.all([loadPdfJs(), response.arrayBuffer()]);

        if (dead) {
          return;
        }
        task = library.getDocument({ data });

        const loaded = await task.promise;

        if (!dead) {
          setPdf(loaded);
          setState("ready");
        }
      } catch {
        if (!dead) {
          setState("error");
        }
      }
    })();
    return () => {
      dead = true;
      void task?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const element = box.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => setWidth(element.clientWidth));

    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !canvas.current || !width) {
      return;
    }

    let task: { cancel: () => void } | null = null;
    let dead = false;

    (async () => {
      const current = await pdf.getPage(page);
      const natural = current.getViewport({ scale: 1 });
      const ratio = window.devicePixelRatio || 1;
      const viewport = current.getViewport({ scale: (width / natural.width) * zoom * ratio });
      const element = canvas.current;
      const context = element?.getContext("2d");

      if (dead || !element || !context) {
        return;
      }
      element.width = viewport.width;
      element.height = viewport.height;
      element.style.width = `${viewport.width / ratio}px`;
      element.style.height = `${viewport.height / ratio}px`;

      const rendering = current.render({ canvasContext: context, viewport, canvas: element });

      task = rendering;
      await rendering.promise.catch(() => undefined);
    })();
    return () => {
      dead = true;
      task?.cancel();
    };
  }, [pdf, page, zoom, width]);

  const pages = pdf?.numPages ?? 0;

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label={t("previousPage")}
        >
          <ChevronLeft />
        </Button>
        <span
          className="min-w-20 text-center text-sm tabular-nums"
          aria-live="polite"
        >
          {pages > 0 ? t("page", { page, pages }) : ""}
        </span>
        <Button
          variant="ghost"
          size="icon"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          aria-label={t("nextPage")}
        >
          <ChevronRight />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          disabled={zoom <= 0.5}
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          aria-label={t("zoomOut")}
        >
          <ZoomOut />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={zoom >= 3}
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          aria-label={t("zoomIn")}
        >
          <ZoomIn />
        </Button>
      </div>
      <div
        ref={box}
        className="min-h-0 overflow-auto rounded-md bg-white"
      >
        {state === "loading" && (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        )}
        {state === "error" && (
          <p
            role="alert"
            className="text-destructive p-4 text-sm"
          >
            {t("couldNotLoad")}
          </p>
        )}
        <canvas
          ref={canvas}
          aria-label={t("pageOf", { title, page })}
          role="img"
          className={state === "ready" ? "block" : "hidden"}
        />
      </div>
    </div>
  );
}
