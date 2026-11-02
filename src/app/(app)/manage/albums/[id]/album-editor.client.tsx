"use client";

import * as React from "react";
import {useRef, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {ArrowDown, ArrowUp, ImageUp, MoreHorizontal, Pencil, RefreshCw, Trash2, Upload} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {CoverImage} from "@/components/album/cover-image.client";
import type {PickedSpex} from "@/components/spex/spex-picker.client";
import {AlbumForm, type KindOption} from "@/components/album/album-form.client";
import {formatDuration} from "@/components/player/lyrics";
import {uploadFile} from "@/components/upload/tus.client";
import type {TrackInput} from "@/gql/graphql";
import {
    createTrackAction,
    publishAlbumAction,
    publishTrackAction,
    removeCoverAction,
    reorderAction,
    replaceAudioAction,
    trashAlbumAction,
    trashTrackAction,
    updateAlbumAction,
    updateTrackAction
} from "@/app/(app)/manage/actions.server";
import {track as trackEvent} from "@/utils/umami";
import {useDialogs} from "@/components/dialogs.client";

export type EditorTrack = {
    id: string;
    discNumber: number;
    trackNumber: number;
    title: string;
    performers?: string | null;
    melody?: string | null;
    lyricsAuthor?: string | null;
    arranger?: string | null;
    lyrics?: string | null;
    lyricsSynced: boolean;
    format: string;
    fileSize: number;
    durationMs: number;
    published: boolean;
    listed: boolean;
    fileMissing: boolean;
};

export type EditorAlbum = {
    id: string;
    title: string;
    year?: number | null;
    kind: { id: string };
    description?: string | null;
    hasCover: boolean;
    published: boolean;
    spex: PickedSpex[];
    tracks: EditorTrack[];
};

const ACCEPT = ".flac,.mp3,.m4a,.aac,.ogg,.oga,.opus,.wav,audio/*";

type UploadState = { name: string; progress: number; state: "uploading" | "processing" | "done" | "failed"; message?: string };

function useAction() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const run = (work: () => Promise<{ ok: boolean; message?: string }>, success?: string) => startTransition(async () => {
        const result = await work();

        if (result.ok) {
            if (success) {
                toast.success(success);
            }
            router.refresh();
        } else {
            toast.error(result.message ?? "Error");
        }
    });

    return {pending, run};
}

function TrackDialog({albumId, track, onClose}: { albumId: string; track: EditorTrack; onClose: () => void }) {
    const t = useTranslations("Manage");
    const {pending, run} = useAction();
    const [input, setInput] = useState<TrackInput>({
        discNumber: track.discNumber,
        trackNumber: track.trackNumber,
        title: track.title,
        performers: track.performers ?? "",
        melody: track.melody ?? "",
        lyricsAuthor: track.lyricsAuthor ?? "",
        arranger: track.arranger ?? "",
        lyrics: track.lyrics ?? "",
        lyricsSynced: track.lyricsSynced,
    });
    const field = (key: keyof TrackInput) => ({
        value: String(input[key] ?? ""),
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInput({...input, [key]: event.target.value}),
    });

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader><DialogTitle>{t("editTrack")}</DialogTitle></DialogHeader>
                <form id="track-form" className="space-y-3" onSubmit={event => {
                    event.preventDefault();
                    run(async () => {
                        const result = await updateTrackAction(albumId, track.id, {
                            ...input,
                            discNumber: Number(input.discNumber),
                            trackNumber: Number(input.trackNumber),
                        });

                        if (result.ok) {
                            onClose();
                        }
                        return result;
                    }, t("saved"));
                }}>
                    <div className="grid grid-cols-[5rem_5rem_1fr] gap-3">
                        <div className="space-y-1"><Label htmlFor="disc">{t("disc")}</Label><Input id="disc" type="number" min={1} {...field("discNumber")}/></div>
                        <div className="space-y-1"><Label htmlFor="number">{t("number")}</Label><Input id="number" type="number" min={1} {...field("trackNumber")}/></div>
                        <div className="space-y-1"><Label htmlFor="track-title">{t("title")}</Label><Input id="track-title" required maxLength={255} {...field("title")}/></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="performers">{t("performers")}</Label><Input id="performers" maxLength={1000} {...field("performers")}/></div>
                    <div className="space-y-1"><Label htmlFor="melody">{t("melody")}</Label><Input id="melody" maxLength={500} placeholder={t("melodyPlaceholder")} {...field("melody")}/></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1"><Label htmlFor="lyrics-author">{t("lyricsAuthor")}</Label><Input id="lyrics-author" maxLength={255} {...field("lyricsAuthor")}/></div>
                        <div className="space-y-1"><Label htmlFor="arranger">{t("arranger")}</Label><Input id="arranger" maxLength={255} {...field("arranger")}/></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="lyrics">{t("lyrics")}</Label><Textarea id="lyrics" rows={8} className="font-mono text-sm" {...field("lyrics")}/></div>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={input.lyricsSynced} onCheckedChange={checked => setInput({...input, lyricsSynced: checked === true})}/>
                        {t("lyricsSynced")}
                    </label>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
                    <Button type="submit" form="track-form" disabled={pending}>{t("save")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Editing an album: its fields, cover, publishing, and its tracks, which are uploaded here, edited, reordered,
 * published one by one and moved to the trash.
 */
export function AlbumEditor({album, kinds}: { album: EditorAlbum; kinds: KindOption[] }) {
    const t = useTranslations("Manage");
    const {confirm} = useDialogs();
    const router = useRouter();
    const {pending, run} = useAction();
    const [uploads, setUploads] = useState<UploadState[]>([]);
    const [editing, setEditing] = useState<EditorTrack | null>(null);
    const [dragging, setDragging] = useState(false);
    const replaceFor = useRef<string | null>(null);
    const replaceInput = useRef<HTMLInputElement>(null);
    const coverInput = useRef<HTMLInputElement>(null);

    const update = (index: number, change: Partial<UploadState>) =>
        setUploads(current => current.map((item, i) => i === index ? {...item, ...change} : item));

    const uploadAll = async (files: File[]) => {
        const start = uploads.length;

        setUploads(current => [...current, ...files.map(file => ({name: file.name, progress: 0, state: "uploading" as const}))]);
        for (const [offset, file] of files.entries()) {
            const index = start + offset;

            try {
                const uploadId = await uploadFile(file, progress => update(index, {progress}));

                update(index, {state: "processing", progress: 1});

                const result = await createTrackAction(album.id, uploadId);

                update(index, result.ok ? {state: "done"} : {state: "failed", message: result.message});
                if (result.ok) {
                    trackEvent("track-upload");
                }
            } catch (error) {
                update(index, {state: "failed", message: error instanceof Error ? error.message : String(error)});
            }
        }
        router.refresh();
    };

    const replaceAudio = async (file: File) => {
        const trackId = replaceFor.current;

        if (!trackId) {
            return;
        }

        const index = uploads.length;

        setUploads(current => [...current, {name: file.name, progress: 0, state: "uploading"}]);
        try {
            const uploadId = await uploadFile(file, progress => update(index, {progress}));

            update(index, {state: "processing", progress: 1});

            const result = await replaceAudioAction(album.id, trackId, uploadId);

            update(index, result.ok ? {state: "done"} : {state: "failed", message: result.message});
            router.refresh();
        } catch (error) {
            update(index, {state: "failed", message: error instanceof Error ? error.message : String(error)});
        }
    };

    const move = (index: number, delta: number) => {
        const ids = album.tracks.map(track => track.id);
        const target = index + delta;

        if (target < 0 || target >= ids.length) {
            return;
        }
        [ids[index], ids[target]] = [ids[target], ids[index]];
        run(() => reorderAction(album.id, ids));
    };

    const uploadCover = (file: File) => run(async () => {
        const form = new FormData();

        form.append("file", file);

        const response = await fetch(`/api/cover-upload/${album.id}`, {method: "POST", body: form});
        const body = await response.json().catch(() => ({})) as { message?: string };

        return response.ok ? {ok: true} : {ok: false, message: body.message ?? t("failed")};
    }, t("saved"));

    return (
        <div className="space-y-10">
            <section className="flex flex-col gap-6 lg:flex-row">
                <div className="w-48 shrink-0 space-y-2">
                    <CoverImage key={String(album.hasCover)} albumId={album.id} title={album.title} className="w-48 rounded-lg shadow"/>
                    <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                           onChange={event => event.target.files?.[0] && uploadCover(event.target.files[0])}/>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" disabled={pending} onClick={() => coverInput.current?.click()}>
                            <ImageUp/>{album.hasCover ? t("replaceCover") : t("uploadCover")}
                        </Button>
                        {album.hasCover && (
                            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => removeCoverAction(album.id))}>
                                {t("removeCover")}
                            </Button>
                        )}
                        {!album.hasCover && <p className="text-xs text-muted-foreground">{t("posterFallback")}</p>}
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <label className="flex items-center gap-3 rounded-lg border p-3">
                        <Switch checked={album.published} disabled={pending}
                                onCheckedChange={checked => {
                                    trackEvent("album-publish", {published: checked});
                                    run(() => publishAlbumAction(album.id, checked));
                                }}/>
                        <span>
                            <span className="block font-medium">{album.published ? t("published") : t("unpublished")}</span>
                            <span className="block text-xs text-muted-foreground">{t("publishText")}</span>
                        </span>
                    </label>
                    <AlbumForm kinds={kinds} submitLabel={t("save")}
                               initial={{
                                   spex: album.spex,
                                   title: album.title,
                                   year: album.year,
                                   kindId: album.kind.id,
                                   description: album.description
                               }}
                               onSubmit={async input => {
                                   const result = await updateAlbumAction(album.id, input);

                                   if (result.ok) {
                                       toast.success(t("saved"));
                                       router.refresh();
                                   } else {
                                       toast.error(result.message);
                                   }
                                   return result.ok;
                               }}/>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">{t("tracks")}</h2>
                <div
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center ${dragging ? "border-primary bg-accent" : ""}`}
                    onDragOver={event => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={event => {
                        event.preventDefault();
                        setDragging(false);
                        void uploadAll(Array.from(event.dataTransfer.files));
                    }}>
                    <Upload className="size-6 text-muted-foreground"/>
                    <p className="text-sm">{t("dropFiles")}</p>
                    <p className="text-xs text-muted-foreground">{t("formats")}</p>
                    <label className="cursor-pointer text-sm text-primary underline-offset-2 hover:underline">
                        {t("chooseFiles")}
                        <input type="file" multiple accept={ACCEPT} className="sr-only"
                               onChange={event => {
                                   const files = Array.from(event.target.files ?? []);

                                   event.target.value = "";
                                   void uploadAll(files);
                               }}/>
                    </label>
                </div>
                <input ref={replaceInput} type="file" accept={ACCEPT} className="hidden"
                       onChange={event => {
                           const file = event.target.files?.[0];

                           event.target.value = "";
                           if (file) {
                               void replaceAudio(file);
                           }
                       }}/>
                {uploads.length > 0 && (
                    <ul className="space-y-1" aria-live="polite">
                        {uploads.map((item, i) => (
                            <li key={`${item.name}-${i}`} className="flex items-center gap-3 text-sm">
                                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                                {item.state === "uploading" && <progress max={1} value={item.progress} className="w-32" aria-label={item.name}/>}
                                <span className={item.state === "failed" ? "text-destructive" : "text-muted-foreground"}>
                                    {item.state === "failed" ? item.message : t(`upload.${item.state}`)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                {album.tracks.length === 0 ? <p className="text-muted-foreground">{t("noTracks")}</p> : (
                    <ol className="divide-y rounded-lg border">
                        {album.tracks.map((track, index) => (
                            <li key={track.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                                <span className="w-10 text-sm tabular-nums text-muted-foreground">
                                    {album.tracks.some(other => other.discNumber > 1) ? `${track.discNumber}.` : ""}{track.trackNumber}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{track.title}</span>
                                        {track.fileMissing && <Badge variant="destructive">{t("fileMissing")}</Badge>}
                                        {!track.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {[track.performers, track.format, formatDuration(track.durationMs / 1000),
                                            `${(track.fileSize / 1024 / 1024).toFixed(1)} MB`].filter(Boolean).join(" · ")}
                                    </div>
                                </div>
                                <Switch checked={track.published} disabled={pending} aria-label={t("publishTrack", {title: track.title})}
                                        onCheckedChange={checked => run(() => publishTrackAction(album.id, track.id, checked))}/>
                                <Button variant="ghost" size="icon" disabled={pending || index === 0} aria-label={t("moveUp", {title: track.title})}
                                        onClick={() => move(index, -1)}><ArrowUp/></Button>
                                <Button variant="ghost" size="icon" disabled={pending || index === album.tracks.length - 1}
                                        aria-label={t("moveDown", {title: track.title})} onClick={() => move(index, 1)}><ArrowDown/></Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("more", {title: track.title})}/>}>
                                        <MoreHorizontal/>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditing(track)}><Pencil/>{t("edit")}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            replaceFor.current = track.id;
                                            replaceInput.current?.click();
                                        }}><RefreshCw/>{t("replaceAudio")}</DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive"
                                                          onClick={() => run(() => trashTrackAction(album.id, track.id, true), t("trashed"))}>
                                            <Trash2/>{t("toTrash")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <section className="space-y-2 rounded-lg border border-destructive/40 p-4">
                <h2 className="font-semibold">{t("trashAlbum")}</h2>
                <p className="text-sm text-muted-foreground">{t("trashAlbumText")}</p>
                <Button variant="destructive" disabled={pending} onClick={async () => {
                    if (await confirm({title: t("confirmTrashAlbum", {title: album.title}), confirmLabel: t("toTrash"), destructive: true})) {
                        run(async () => {
                            const result = await trashAlbumAction(album.id, true);

                            if (result.ok) {
                                router.push("/manage/albums");
                            }
                            return result;
                        }, t("trashed"));
                    }
                }}><Trash2/>{t("toTrash")}</Button>
            </section>

            {editing && <TrackDialog albumId={album.id} track={editing} onClose={() => setEditing(null)}/>}
        </div>
    );
}
