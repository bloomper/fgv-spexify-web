"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Download, Film, ListPlus, MoreHorizontal, Pause, Play, Star, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {type PlayerTrack, usePlayer} from "@/components/player/player-provider.client";
import {formatDuration} from "@/components/player/lyrics";
import {addToPlaylistAction, removeFromPlaylistAction, starAction} from "@/app/(app)/actions.server";
import {cn} from "@/utils/utils";

export type TrackRow = PlayerTrack & {
    discNumber: number;
    trackNumber: number;
    melody?: string | null;
    listed: boolean;
    fileMissing: boolean;
    videoLinks?: { videoId: string; videoTitle: string; chapterTitle: string; startSeconds: number }[];
};

type Props = {
    tracks: TrackRow[];
    starred: string[];
    playlists: { id: string; name: string }[];
    spexflixUrl: string | null;
    showAlbum?: boolean;
    /** On a playlist's page: offers removing a track from it, by its position. */
    playlistId?: string;
};

/**
 * Tracks with play buttons, stars, downloads, playlists and links to Spexflix. Stars and playlists live in Navidrome,
 * so they work only for published tracks, which Navidrome knows.
 */
export function TrackList({tracks, starred: initialStarred, playlists, spexflixUrl, showAlbum, playlistId}: Props) {
    const t = useTranslations("Album");
    const player = usePlayer();
    const [starred, setStarred] = useState(() => new Set(initialStarred));
    const [, startTransition] = useTransition();
    const playable = tracks.filter(track => !track.fileMissing);
    const discs = new Set(tracks.map(track => track.discNumber)).size > 1;

    const toggleStar = (track: TrackRow) => {
        if (!track.navidromeId) {
            return;
        }

        const id = track.navidromeId;
        const next = !starred.has(id);

        setStarred(current => {
            const copy = new Set(current);

            if (next) {
                copy.add(id);
            } else {
                copy.delete(id);
            }
            return copy;
        });
        startTransition(async () => {
            const result = await starAction(id, next);

            if (!result.ok) {
                toast.error(t("starFailed"));
            }
        });
    };

    const addTo = (track: TrackRow, playlistId: string | null) => {
        if (!track.navidromeId) {
            return;
        }

        const name = playlistId ? null : window.prompt(t("playlistName"));

        if (!playlistId && !name) {
            return;
        }
        startTransition(async () => {
            const result = await addToPlaylistAction(playlistId, name, [track.navidromeId!]);

            if (result.ok) {
                toast.success(t("addedToPlaylist"));
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <ol className="divide-y rounded-lg border">
            {tracks.map((track, i) => {
                const isCurrent = player.current?.id === track.id;
                const playIndex = playable.indexOf(track);
                const newDisc = discs && (i === 0 || tracks[i - 1].discNumber !== track.discNumber);

                return (
                    <React.Fragment key={track.id}>
                        {newDisc && (
                            <li className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                {t("disc", {number: track.discNumber})}
                            </li>
                        )}
                        <li className={cn("flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3", isCurrent && "bg-accent")}>
                            <Button variant="ghost" size="icon" className="size-10 shrink-0" disabled={track.fileMissing}
                                    aria-label={isCurrent && player.playing ? t("pause", {title: track.title}) : t("play", {title: track.title})}
                                    onClick={() => isCurrent ? player.toggle() : player.playQueue(playable, playIndex)}>
                                {isCurrent && player.playing ? <Pause/> :
                                    <span className="text-sm tabular-nums text-muted-foreground group-hover:hidden">
                                        {isCurrent ? <Play/> : track.trackNumber}
                                    </span>}
                            </Button>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium">{track.title}</span>
                                    {!track.listed && <Badge variant="outline">{t("unpublished")}</Badge>}
                                    {track.fileMissing && <Badge variant="destructive">{t("fileMissing")}</Badge>}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {[showAlbum ? track.albumTitle : null, track.performers, track.melody ? t("melody", {melody: track.melody}) : null]
                                        .filter(Boolean).join(" · ")}
                                </div>
                                {spexflixUrl && track.videoLinks && track.videoLinks.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {track.videoLinks.map(link => (
                                            <a key={`${link.videoId}-${link.startSeconds}`}
                                               href={`${spexflixUrl}/videos/${link.videoId}?t=${link.startSeconds}`}
                                               target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline">
                                                <Film className="size-3.5"/>{t("watchInSpexflix", {video: link.videoTitle})}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {track.navidromeId && (
                                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => toggleStar(track)}
                                        aria-pressed={starred.has(track.navidromeId)}
                                        aria-label={starred.has(track.navidromeId) ? t("unstar", {title: track.title}) : t("star", {title: track.title})}>
                                    <Star className={cn(starred.has(track.navidromeId) && "fill-current text-yellow-500")}/>
                                </Button>
                            )}
                            <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
                                {formatDuration(track.durationMs / 1000)}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="shrink-0" aria-label={t("more", {title: track.title})}/>}>
                                    <MoreHorizontal/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => player.enqueue([track])} disabled={track.fileMissing}>
                                        <ListPlus/>{t("addToQueue")}
                                    </DropdownMenuItem>
                                    {track.navidromeId && (
                                        <>
                                            <DropdownMenuSeparator/>
                                            {playlists.map(playlist => (
                                                <DropdownMenuItem key={playlist.id} onClick={() => addTo(track, playlist.id)}>
                                                    <ListPlus/>{t("addToPlaylist", {name: playlist.name})}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuItem onClick={() => addTo(track, null)}>
                                                <ListPlus/>{t("newPlaylist")}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem render={<a href={`/api/download/track/${track.id}`} download/>} disabled={track.fileMissing}>
                                        <Download/>{t("download")}
                                    </DropdownMenuItem>
                                    {playlistId && (
                                        <DropdownMenuItem onClick={() => startTransition(async () => {
                                            const result = await removeFromPlaylistAction(playlistId, i);

                                            if (!result.ok) {
                                                toast.error(result.message);
                                            }
                                        })}>
                                            <X/>{t("removeFromPlaylist")}
                                        </DropdownMenuItem>
                                    )}
                                    {showAlbum && (
                                        <DropdownMenuItem render={<Link href={`/albums/${track.albumId}`}/>}>
                                            {t("goToAlbum")}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>
                    </React.Fragment>
                );
            })}
        </ol>
    );
}

export function PlayAllButtons({tracks}: { tracks: TrackRow[] }) {
    const t = useTranslations("Album");
    const player = usePlayer();
    const playable = tracks.filter(track => !track.fileMissing);

    return (
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => player.playQueue(playable, 0)} disabled={playable.length === 0}>
                <Play/>{t("playAll")}
            </Button>
            <Button variant="outline" onClick={() => {
                player.setShuffle(true);
                player.playQueue(playable, Math.floor(Math.random() * playable.length));
            }} disabled={playable.length === 0}>
                {t("shuffle")}
            </Button>
        </div>
    );
}
