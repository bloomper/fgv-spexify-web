"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, ExternalLink, FileMusic, FileText, Music } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import type { TrackStudio } from "@/components/sheet/actions.server";
import { PdfReader } from "@/components/sheet/pdf-reader.client";
import { ScoreView } from "@/components/sheet/score-view.client";
import { cn } from "@/utils/utils";

type SheetMusic = NonNullable<TrackStudio["sheetMusic"]>;
type SheetFile = SheetMusic["versions"][number]["files"][number];

/**
 * The file shown first: the score as notes when there is MusicXML, else a PDF, else MIDI, else the first file.
 */
export function firstFile(files: SheetFile[]): SheetFile | null {
  for (const kind of ["MUSIC_XML", "PDF", "MIDI"] as const) {
    const file = files.find(candidate => candidate.kind === kind);

    if (file) {
      return file;
    }
  }
  return files[0] ?? null;
}

/**
 * A file's name in the picker: its title, with its instruments and desk for a part.
 */
export function fileLabel(file: SheetFile, locale: string): string {
  const instruments = locale === "en" ? file.instrumentsEn : file.instrumentsSv;
  const extra = [instruments.join(", "), file.desk].filter(Boolean).join(" ");

  return extra && !file.title.includes(extra) ? `${file.title} (${extra})` : file.title;
}

const ICONS = { PDF: FileText, MUSIC_XML: FileMusic, MIDI: Music, OTHER: Download } as const;

/**
 * The sheet music of the playing number in Spexarkivet: pick a version and a file, then read the PDF, follow the
 * notes, or play them.
 */
export function SheetMusicPanel({ trackId, studio, onChanged }: {
  trackId: string;
  studio: TrackStudio & { sheetMusic: SheetMusic };
  onChanged: () => Promise<void>;
}) {
  const t = useTranslations("Sheet");
  const locale = useLocale();
  const { sheetMusic } = studio;
  const [versionId, setVersionId] = useState(sheetMusic.versions[0]?.id);
  const version = sheetMusic.versions.find(candidate => candidate.id === versionId) ?? sheetMusic.versions[0];
  const [fileId, setFileId] = useState<string | undefined>(() => firstFile(version?.files ?? [])?.id);
  const file = version?.files.find(candidate => candidate.id === fileId) ?? firstFile(version?.files ?? []);

  if (!version || !file) {
    return <p className="text-sm text-muted-foreground">{t("none")}</p>;
  }

  const url = `/api/sheet-music/${trackId}/${file.id}`;
  const roleName = locale === "en" ? file.roleEn : file.roleSv;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {sheetMusic.versions.length > 1 ? (
          <select value={version.id} aria-label={t("version")}
                  onChange={event => {
                    const next = sheetMusic.versions.find(candidate => candidate.id === event.target.value);

                    setVersionId(event.target.value);
                    setFileId(firstFile(next?.files ?? [])?.id);
                  }}
                  className="h-8 rounded-md border bg-background px-2">
            {sheetMusic.versions.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
          </select>
        ) : <span className="font-medium">{version.label}</span>}
        <span className="text-muted-foreground">
          {[version.arranger && t("arrangedBy", { arranger: version.arranger }), version.key, version.tempo].filter(Boolean).join(" · ")}
        </span>
        <div className="flex-1" />
        {sheetMusic.archiveUrl && (
          <Button variant="ghost" size="sm" nativeButton={false}
                  render={<a href={sheetMusic.archiveUrl} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLink />{t("inArchive")}
          </Button>
        )}
      </div>
      <ul aria-label={t("files")} className="flex flex-wrap gap-1">
        {version.files.map(candidate => {
          const Icon = ICONS[candidate.kind];

          return (
            <li key={candidate.id}>
              <button type="button" aria-pressed={candidate.id === file.id} onClick={() => setFileId(candidate.id)}
                      className={cn("flex min-h-8 items-center gap-1 rounded-full px-3 text-sm",
                        candidate.id === file.id ? "bg-foreground text-background" : "bg-secondary/80 hover:bg-secondary")}>
                <Icon className="size-4" />{fileLabel(candidate, locale)}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-h-0 flex-1">
        {file.kind === "PDF" && <PdfReader key={file.id} url={url} title={file.title} />}
        {(file.kind === "MUSIC_XML" || file.kind === "MIDI") && (
          <ScoreView key={file.id} trackId={trackId} fileId={file.id} title={file.title} midi={file.kind === "MIDI"}
                     syncs={studio.scoreSyncs.filter(sync => sync.fileId === file.id)} editor={studio.editor} onChanged={onChanged} />
        )}
        {file.kind === "OTHER" && <p className="text-sm text-muted-foreground">{t("downloadOnly", { role: roleName })}</p>}
        <div className="mt-2">
          <a href={`${url}?download=true`} className="inline-flex items-center gap-1 text-xs text-link hover:text-link/80">
            <Download className="size-3.5" />{t("download", { name: `${file.title}.${file.extension}` })}
          </a>
        </div>
      </div>
    </div>
  );
}
