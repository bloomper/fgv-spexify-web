"use client";

import * as React from "react";
import { useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Film,
  Heart,
  ListPlus,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { playedSince, type PlayerTrack, usePlayer } from "@/components/player/player-provider.client";
import { formatDuration } from "@/components/player/lyrics";
import {
  addToPlaylistAction,
  rateAction,
  removeFromPlaylistAction,
  reorderPlaylistAction,
  starAction,
} from "@/app/(app)/actions.server";
import { useRadio } from "@/components/player/radio.client";
import { creditHref, splitCredits } from "@/lib/credits";
import { AverageRating, RatingInput, RatingStars } from "@/components/rating.client";
import { cn } from "@/utils/utils";
import { formatDate } from "@/utils/format";
import { useDialogs } from "@/components/dialogs.client";
import { track as trackEvent } from "@/utils/umami";
import { useServerState } from "@/hooks/use-server-state.client";

export type TrackRow = PlayerTrack & {
  discNumber: number;
  trackNumber: number;
  melody?: string | null;
  lyricsAuthor?: string | null;
  arranger?: string | null;
  listed: boolean;
  fileMissing: boolean;
  videoLinks?: { videoId: string; videoTitle: string; chapterTitle: string; startSeconds: number }[];
  /** How often the user played it, from Navidrome; undefined when not known. */
  playCount?: number;
  /** When the user last played it. */
  played?: string | null;
  /** The user's rating, 1 to 5, or 0 when not rated; undefined when not known. */
  rating?: number;
  /** Everyone's average rating, or null when nobody rated it. */
  averageRating?: number | null;
  ratingCount?: number;
};

type Props = {
  tracks: TrackRow[];
  starred: string[];
  playlists: { id: string; name: string }[];
  spexflixUrl: string | null;
  showAlbum?: boolean;
  /** On a playlist's page: offers removing a track from it, by its position, and moving it. */
  playlistId?: string;
};

/**
 * The names in a credit as links to their pages, separated by commas.
 */
function CreditLinks({ value, kind }: { value: string; kind: "PERFORMER" | "MELODY" }) {
  const names = kind === "MELODY" ? [value.trim()] : splitCredits(value);

  return names.map((name, i) => (
    <React.Fragment key={name}>
      {i > 0 && ", "}
      <Link href={creditHref(kind, name)} className="hover:text-foreground hover:underline">{name}</Link>
    </React.Fragment>
  ));
}

/**
 * The row's subtitle: album, performers and melody, the latter two linking to everything else they are in.
 */
function TrackSubtitle({ track, showAlbum }: { track: TrackRow; showAlbum?: boolean }) {
  const t = useTranslations("Album");
  const parts: React.ReactNode[] = [];

  if (showAlbum) {
    parts.push(<Link key="album" href={`/albums/${track.albumId}`}
                     className="hover:text-foreground hover:underline">{track.albumTitle}</Link>);
  }
  if (track.performers) {
    parts.push(<CreditLinks key="performers" value={track.performers} kind="PERFORMER" />);
  }
  if (track.melody) {
    parts.push(<React.Fragment key="melody">{t("melodyLabel")} <CreditLinks value={track.melody}
                                                                            kind="MELODY" /></React.Fragment>);
  }
  return parts.map((part, i) => <React.Fragment key={i}>{i > 0 && " · "}{part}</React.Fragment>);
}

/**
 * Tracks with play buttons, likes, ratings, downloads, playlists and links to Spexflix. Stars, playlists and play counts live in
 * Navidrome, so they work only for published tracks, which Navidrome knows. Hovering a row shows a play button in
 * place of its number.
 */
export function TrackList({ tracks, starred: initialStarred, playlists, spexflixUrl, showAlbum, playlistId }: Props) {
  const t = useTranslations("Album");
  const player = usePlayer();
  const radio = useRadio();
  const { prompt } = useDialogs();
  const [starred, setStarred] = useServerState(new Set(initialStarred), ids => [...ids].sort().join());
  const [ratings, setRatings] = useServerState<Record<string, number>>(
    Object.fromEntries(tracks.map(track => [track.id, track.rating ?? 0])), JSON.stringify);
  const ratingOf = (track: TrackRow) => ratings[track.id] ?? track.rating ?? 0;
  const [, startTransition] = useTransition();
  const playable = tracks.filter(track => !track.fileMissing);
  const discs = new Set(tracks.map(track => track.discNumber)).size > 1;

  // Plays this session reported count at once, until Navidrome's own numbers include them
  const playsOf = (track: TrackRow) => {
    const session = track.navidromeId ? player.plays[track.navidromeId] : undefined;

    if (!session || track.playCount === undefined || !playedSince(track.played, session.at)) {
      return { playCount: track.playCount, played: track.played };
    }
    return { playCount: track.playCount + session.count, played: session.at };
  };

  const moveInPlaylist = (from: number, to: number) => {
    if (!playlistId || to < 0 || to >= tracks.length) {
      return;
    }

    const ids = tracks.map(track => track.navidromeId!);
    const [moved] = ids.splice(from, 1);

    ids.splice(to, 0, moved);
    startTransition(async () => {
      const result = await reorderPlaylistAction(playlistId, ids);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  };

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

      if (result.ok) {
        trackEvent("track-star", { starred: next });
      } else {
        setStarred(current => {
          const copy = new Set(current);

          if (next) {
            copy.delete(id);
          } else {
            copy.add(id);
          }
          return copy;
        });
        toast.error(t("starFailed"));
      }
    });
  };

  const rate = (track: TrackRow, rating: number) => {
    if (!track.navidromeId) {
      return;
    }

    const previous = ratingOf(track);
    const id = track.navidromeId;

    setRatings(current => ({ ...current, [track.id]: rating }));
    startTransition(async () => {
      const result = await rateAction(id, rating);

      if (result.ok) {
        trackEvent("track-rate", { rating });
      } else {
        setRatings(current => ({ ...current, [track.id]: previous }));
        toast.error(t("rateFailed"));
      }
    });
  };

  const addTo = async (track: TrackRow, playlistId: string | null) => {
    if (!track.navidromeId) {
      return;
    }

    const name = playlistId ? null : await prompt({
      title: t("newPlaylistTitle"),
      label: t("playlistName"),
      confirmLabel: t("createPlaylist"),
      maxLength: 100,
    });

    if (!playlistId && !name) {
      return;
    }
    startTransition(async () => {
      const result = await addToPlaylistAction(playlistId, name, [track.navidromeId!]);

      if (result.ok) {
        trackEvent("playlist-add", { created: !playlistId });
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
        const { playCount, played } = playsOf(track);

        return (
          <React.Fragment key={track.id}>
            {newDisc && (
              <li className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {t("disc", { number: track.discNumber })}
              </li>
            )}
            <li className={cn("group/track flex items-center gap-2 px-2 py-2 hover:bg-muted/50 sm:gap-3 sm:px-3",
              isCurrent && "bg-accent hover:bg-accent")}>
              <Button variant="ghost" size="icon" className="size-10 shrink-0" disabled={track.fileMissing}
                      aria-label={isCurrent && player.playing ? t("pause", { title: track.title }) : t("play", { title: track.title })}
                      onClick={() => isCurrent ? player.toggle() : player.playQueue(playable, playIndex)}>
                {isCurrent && player.playing ? <Pause /> : isCurrent || track.fileMissing ? (
                  isCurrent ? <Play /> :
                    <span className="text-sm tabular-nums text-muted-foreground">{track.trackNumber}</span>
                ) : (
                  <>
                                        <span
                                          className="text-sm tabular-nums text-muted-foreground group-hover/track:hidden group-focus-within/track:hidden">
                                            {track.trackNumber}
                                        </span>
                    <Play className="hidden group-hover/track:block group-focus-within/track:block"
                          data-testid="hover-play" />
                  </>
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{track.title}</span>
                  {!track.listed && <Badge variant="outline">{t("unpublished")}</Badge>}
                  {track.fileMissing && <Badge variant="destructive">{t("fileMissing")}</Badge>}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  <TrackSubtitle track={track} showAlbum={showAlbum} />
                </div>
                {track.navidromeId && track.rating === undefined && (
                  <AverageRating average={track.averageRating} count={track.ratingCount}
                                 className="hidden sm:inline-flex" />
                )}
                {track.navidromeId && (
                  <div className="flex items-center gap-2 sm:hidden">
                    <RatingStars value={ratingOf(track)} />
                    <AverageRating average={track.averageRating} count={track.ratingCount} />
                  </div>
                )}
                {spexflixUrl && track.videoLinks && track.videoLinks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {track.videoLinks.map(link => (
                      <a key={`${link.videoId}-${link.startSeconds}`}
                         href={`${spexflixUrl}/videos/${link.videoId}?t=${link.startSeconds}`}
                         target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline">
                        <Film className="size-3.5" />{t("watchInSpexflix", { video: link.videoTitle })}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {track.navidromeId && (
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => toggleStar(track)}
                        aria-pressed={starred.has(track.navidromeId)}
                        aria-label={starred.has(track.navidromeId) ? t("unstar", { title: track.title }) : t("star", { title: track.title })}>
                  <Heart className={cn(starred.has(track.navidromeId) && "fill-current text-rose-500")} />
                </Button>
              )}
              {track.navidromeId && track.rating !== undefined && (
                <span className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
                                    <RatingInput value={ratingOf(track)} onChange={rating => rate(track, rating)}
                                                 label={t("rate", { title: track.title })} />
                                    <AverageRating average={track.averageRating} count={track.ratingCount} />
                                </span>
              )}
              {playCount !== undefined && (
                <span className="hidden w-28 shrink-0 text-right text-xs tabular-nums text-muted-foreground lg:block"
                      title={played ? t("lastPlayed", { date: formatDate(played) ?? "" }) : undefined}>
                                    {playCount > 0 ? (
                                      <>
                                        <span className="block">{t("plays", { count: playCount })}</span>
                                        {played && <span className="block">{formatDate(played)}</span>}
                                      </>
                                    ) : <span className="block">{t("neverPlayed")}</span>}
                                </span>
              )}
              <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
                                {formatDuration(track.durationMs / 1000)}
                            </span>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="shrink-0"
                                                     aria-label={t("more", { title: track.title })} />}>
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => player.enqueue([track])} disabled={track.fileMissing}>
                    <ListPlus />{t("addToQueue")}
                  </DropdownMenuItem>
                  {track.listed && !track.fileMissing && (
                    <DropdownMenuItem onClick={() => radio.start({ trackId: track.id })} disabled={radio.pending}>
                      <Radio />{t("startRadio")}
                    </DropdownMenuItem>
                  )}
                  {track.navidromeId && (
                    <>
                      <DropdownMenuSeparator className="sm:hidden" />
                      <div className="flex items-center justify-between gap-3 px-2 py-1 text-sm sm:hidden">
                        <span>{t("rateTrack")}</span>
                        <RatingInput value={ratingOf(track)} onChange={rating => rate(track, rating)}
                                     label={t("rate", { title: track.title })} />
                      </div>
                      <DropdownMenuSeparator />
                      {playlists.map(playlist => (
                        <DropdownMenuItem key={playlist.id} onClick={() => void addTo(track, playlist.id)}>
                          <ListPlus />{t("addToPlaylist", { name: playlist.name })}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => void addTo(track, null)}>
                        <ListPlus />{t("newPlaylist")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<a href={`/api/download/track/${track.id}`} download data-umami-event="track-download" />}
                    disabled={track.fileMissing}>
                    <Download />{t("download")}
                  </DropdownMenuItem>
                  {playlistId && (
                    <DropdownMenuItem onClick={() => startTransition(async () => {
                      const result = await removeFromPlaylistAction(playlistId, i);

                      if (!result.ok) {
                        toast.error(result.message);
                      }
                    })}>
                      <X />{t("removeFromPlaylist")}
                    </DropdownMenuItem>
                  )}
                  {playlistId && i > 0 && (
                    <DropdownMenuItem onClick={() => moveInPlaylist(i, i - 1)}>
                      <ArrowUp />{t("moveUp")}
                    </DropdownMenuItem>
                  )}
                  {playlistId && i < tracks.length - 1 && (
                    <DropdownMenuItem onClick={() => moveInPlaylist(i, i + 1)}>
                      <ArrowDown />{t("moveDown")}
                    </DropdownMenuItem>
                  )}
                  {showAlbum && (
                    <DropdownMenuItem render={<Link href={`/albums/${track.albumId}`} />}>
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

export function PlayAllButtons({ tracks, radioAlbumId }: { tracks: TrackRow[]; radioAlbumId?: string }) {
  const t = useTranslations("Album");
  const player = usePlayer();
  const radio = useRadio();
  const playable = tracks.filter(track => !track.fileMissing);

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => player.playQueue(playable, 0)} disabled={playable.length === 0}>
        <Play />{t("playAll")}
      </Button>
      <Button variant="outline" onClick={() => {
        player.setShuffle(true);
        player.playQueue(playable, Math.floor(Math.random() * playable.length));
      }} disabled={playable.length === 0}>
        {t("shuffle")}
      </Button>
      {radioAlbumId && (
        <Button variant="outline" onClick={() => radio.start({ albumId: radioAlbumId })} disabled={radio.pending}>
          <Radio />{t("albumRadio")}
        </Button>
      )}
    </div>
  );
}
