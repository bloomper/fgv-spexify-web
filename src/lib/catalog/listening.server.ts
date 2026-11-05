import "server-only";

import {
  getAlbumList,
  getAlbumWithSongs,
  getPlaylists,
  getStarredAll,
  type Plays,
  playsOf,
} from "@/lib/subsonic.server";
import { getAlbumsByNavidromeIds } from "@/lib/catalog/catalog.server";

/**
 * What the track list needs from Navidrome: the user's starred songs (with their plays) and playlists. Navidrome being
 * unavailable must not break the page, so both fall back to empty.
 */
export async function getListeningState(): Promise<{
  starred: string[];
  starredPlays: Plays;
  /** Navidrome ids of the starred albums. */
  starredAlbums: string[];
  playlists: { id: string; name: string }[];
}> {
  const [starred, playlists] = await Promise.all([
    getStarredAll().catch(() => ({ songs: [], albums: [] })),
    // Others' public playlists can be listened to but not added to
    // The ones changed most recently first: menus show only the first few
    getPlaylists().then(list => list.filter(playlist => !playlist.readonly)
      .sort((a, b) => (b.changed ?? "").localeCompare(a.changed ?? ""))
      .map(playlist => ({ id: playlist.id, name: playlist.name })))
      .catch(() => []),
  ]);

  return {
    starred: starred.songs.map(song => song.id),
    starredPlays: playsOf(starred.songs),
    starredAlbums: starred.albums.map(album => album.id),
    playlists,
  };
}

/**
 * The user's plays and ratings of an album's songs, and the album's own rating and star; nothing when the album is not
 * in Navidrome or Navidrome is unavailable.
 */
export async function getAlbumListening(navidromeAlbumId: string | null | undefined): Promise<{
  plays: Plays;
  rating: number;
  starred: boolean
} | null> {
  if (!navidromeAlbumId) {
    return null;
  }
  return getAlbumWithSongs(navidromeAlbumId)
    .then(album => ({ plays: playsOf(album.songs), rating: album.rating, starred: album.starred }))
    .catch(() => null);
}

/**
 * The user's starred albums as Spexify's albums; empty when Navidrome is unavailable.
 */
export async function getStarredAlbums(navidromeIds: string[]) {
  return getAlbumsByNavidromeIds(navidromeIds).catch(() => []);
}

/**
 * The user's recently played, most played and highest rated albums, as Spexify's albums with Navidrome's play count,
 * last play and the user's rating. Albums no longer listed are left out; Navidrome being unavailable gives empty lists.
 */
export async function getPlayedAlbums(size = 12) {
  const [recent, frequent, highest] = await Promise.all([
    getAlbumList("recent", size).catch(() => []),
    getAlbumList("frequent", size).catch(() => []),
    getAlbumList("highest", size).catch(() => []),
  ]);
  const albums = await getAlbumsByNavidromeIds([...new Set([...recent, ...frequent, ...highest].map(album => album.id))]).catch(() => []);
  const byId = new Map(albums.map(album => [album.navidromeId, album]));
  const join = (list: typeof recent) => list.flatMap(played => {
    const album = byId.get(played.id);

    return album ? [{
      ...album,
      playCount: played.playCount ?? 0,
      played: played.played ?? null,
      rating: played.userRating ?? 0,
    }] : [];
  });

  return {
    recent: join(recent),
    frequent: join(frequent).filter(album => album.playCount > 0),
    highest: join(highest).filter(album => album.rating > 0),
  };
}

/**
 * Spexflix's address, for links from tracks to videos; null when it is not configured.
 */
export function spexflixUrl(): string | null {
  return process.env.SPEXFLIX_WEB_URL?.replace(/\/$/, "") || null;
}
