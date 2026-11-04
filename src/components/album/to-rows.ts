import type { TrackRow } from "@/components/album/track-list.client";
import type { Plays } from "@/lib/subsonic.server";

type TrackLike = {
  id: string;
  title: string;
  albumId: string;
  albumTitle: string;
  discNumber: number;
  trackNumber: number;
  performers?: string | null;
  melody?: string | null;
  lyricsAuthor?: string | null;
  arranger?: string | null;
  durationMs: number;
  navidromeId?: string | null;
  lyrics?: string | null;
  lyricsSynced: boolean;
  listed: boolean;
  fileMissing: boolean;
  videoLinks?: { videoId: string; videoTitle: string; chapterTitle: string; startSeconds: number }[];
  replayGain?: TrackRow["replayGain"];
  averageRating?: number | null;
  ratingCount?: number;
};

/**
 * Tracks as the track list shows them, with the user's play counts from Navidrome when given.
 */
export function toRows(tracks: TrackLike[], plays: Plays = {}): TrackRow[] {
  return tracks.map(track => ({
    id: track.id,
    title: track.title,
    albumId: track.albumId,
    albumTitle: track.albumTitle,
    discNumber: track.discNumber,
    trackNumber: track.trackNumber,
    performers: track.performers,
    melody: track.melody,
    lyricsAuthor: track.lyricsAuthor,
    arranger: track.arranger,
    replayGain: track.replayGain,
    durationMs: track.durationMs,
    navidromeId: track.navidromeId,
    lyrics: track.lyrics,
    lyricsSynced: track.lyricsSynced,
    listed: track.listed,
    fileMissing: track.fileMissing,
    videoLinks: track.videoLinks,
    playCount: track.navidromeId ? plays[track.navidromeId]?.playCount : undefined,
    played: track.navidromeId ? plays[track.navidromeId]?.played : undefined,
    rating: track.navidromeId ? plays[track.navidromeId]?.rating ?? 0 : undefined,
    averageRating: track.averageRating,
    ratingCount: track.ratingCount,
  }));
}
