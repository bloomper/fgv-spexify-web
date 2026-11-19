/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AlbumFilter = {
  /** The main spex's category. */
  categoryId?: string | number | null | undefined;
  /** Albums from this year on. */
  fromYear?: number | null | undefined;
  /** EDITOR only. */
  includeUnpublished?: boolean | null | undefined;
  kindId?: string | number | null | undefined;
  /** Only albums the caller likes. */
  liked?: boolean | null | undefined;
  sort?: AlbumSort | null | undefined;
  /** Albums about the spex or, when it is an original, one of its revivals. */
  spexId?: string | number | null | undefined;
  /** Albums up to and including this year. */
  toYear?: number | null | undefined;
  year?: number | null | undefined;
};

export type AlbumInput = {
  /** For a released record, e.g. 'CEP 019'. */
  catalogueNumber?: string | null | undefined;
  /** Free text, as on the record. */
  conductor?: string | null | undefined;
  description?: string | null | undefined;
  /** An album kind; defaults to the first one for a new album and to the current one for an existing album. */
  kindId?: string | number | null | undefined;
  /** An album medium; none for an album that was never released. */
  mediumId?: string | number | null | undefined;
  recorded?: string | null | undefined;
  /** As precise as known: '1987', '1987-04' or '1987-04-12'. */
  released?: string | null | undefined;
  /** Spex in Spexipedia, the main one first, e.g. several for a compilation. Empty when the album is not about any spex, e.g. a jubilee recording. */
  spexIds?: Array<string | number>;
  /** Defaults to the main spex's title; required without a spex. */
  title?: string | null | undefined;
  /** Defaults to the main spex's year. */
  year?: number | null | undefined;
};

export type AlbumKindInput = {
  /** Null leaves them as they are. */
  aliases?: Array<string> | null | undefined;
  nameEn: string;
  nameSv: string;
};

export type AlbumMediumInput = {
  /** Null leaves them as they are. */
  aliases?: Array<string> | null | undefined;
  nameEn: string;
  nameSv: string;
};

/** How to order albums. Ties keep the default order: newest year first, then title. */
export type AlbumSort =
  /** Most liked first. */
  | 'LIKES'
  /** Most played by everyone first. */
  | 'PLAYS'
  /** Most recently published first. */
  | 'PUBLISHED'
  /** Highest weighted average rating first; unrated albums last. */
  | 'RATING'
  | 'TITLE'
  | 'YEAR_ASC'
  /** Newest year first; the default. */
  | 'YEAR_DESC';

/** What to show of the audit log; every field is optional. */
export type AuditFilter = {
  /** CREATE, UPDATE, DELETE and so on. */
  action?: string | null | undefined;
  /** Who made the change; only ADMIN sees others' changes. */
  actorId?: string | null | undefined;
  /** One record's changes. */
  entityId?: string | number | null | undefined;
  /** What was changed, e.g. ALBUM or VIDEO. */
  entityType?: string | null | undefined;
  /** Changes from this instant on. */
  from?: string | null | undefined;
  /** Text the summary contains. */
  q?: string | null | undefined;
  /** Changes before this instant. */
  to?: string | null | undefined;
};

export type CollectionInput = {
  albumIds: Array<string | number>;
  description?: string | null | undefined;
  title: string;
};

/** Who or what a track is credited to. Names are split on commas, semicolons, slashes and ampersands. */
export type CreditKind =
  | 'ARRANGER'
  | 'LYRICS_AUTHOR'
  /** The original song, e.g. Dancing Queen (ABBA). */
  | 'MELODY'
  /** The artist in parentheses at the end of the melody, e.g. ABBA. */
  | 'ORIGINAL_ARTIST'
  | 'PERFORMER';

/**
 * A scheduled maintenance job: copying the current spex data and the kinds of linked numbers from Spexipedia in full (SPEX_REFRESH; other changes also arrive from its change feed within minutes), removing uploads that
 * were never used (UPLOAD_CLEANUP), measuring the loudness of tracks that have none yet, for ReplayGain
 * (LOUDNESS_SCAN), copying everyone's ratings, likes and plays from Navidrome, for averages and top lists
 * (LISTENING_SYNC), and aligning recordings with the MusicXML scores of their sheet music in Spexarkivet that have no
 * automatic map for that score and recording yet, so that the cursor follows the notes (SCORE_ALIGN).
 */
export type MaintenanceJob =
  | 'LISTENING_SYNC'
  | 'LOUDNESS_SCAN'
  | 'SCORE_ALIGN'
  | 'SPEX_REFRESH'
  | 'UPLOAD_CLEANUP';

export type ScoreSyncInput = {
  jumps?: Array<SyncJumpInput> | null | undefined;
  /** At most 5000, seconds strictly increasing. */
  points: Array<SyncPointInput>;
};

export type ScoreSyncMethod =
  /** Found by aligning the recording with the score. */
  | 'AUTOMATIC'
  /** Made by an editor; wins over the automatic one. */
  | 'MANUAL';

export type ScoreSyncStatus =
  | 'DONE'
  | 'FAILED'
  | 'PENDING'
  | 'RUNNING';

export type SettingsInput = {
  appPasswordExpiryMonths: number;
  lockoutAttempts: number;
  lockoutMinutes: number;
  welcomeEn?: string | null | undefined;
  welcomeSv?: string | null | undefined;
};

/** What the web can do with a sheet music file. */
export type SheetFileKind =
  /** Play it. */
  | 'MIDI'
  /** Draw it as notes, follow the recording with a cursor, or play it. */
  | 'MUSIC_XML'
  /** Download it. */
  | 'OTHER'
  /** Read it. */
  | 'PDF';

export type SyncJumpInput = {
  after: number;
  nth?: number | null | undefined;
  to: number;
};

export type SyncPointInput = {
  beat: number;
  measure: number;
  seconds: number;
};

/**
 * What a top list ranks by. Navidrome keeps ratings, likes and plays per user; Spexify mirrors them as the Subsonic
 * gateway passes them on, and copies them every night (LISTENING_SYNC).
 */
export type TopBy =
  /** How many like it. */
  | 'LIKED'
  /** How often everyone played it; an album counts its tracks' plays. */
  | 'PLAYED'
  /** Everyone's ratings, as an average weighed against two votes of the mean of all ratings, so that one 5 does not top the list. */
  | 'RATED';

export type TrackInput = {
  arranger?: string | null | undefined;
  discNumber: number;
  lyrics?: string | null | undefined;
  lyricsAuthor?: string | null | undefined;
  /** Whether the lyrics are LRC with timestamps. */
  lyricsSynced: boolean;
  melody?: string | null | undefined;
  performers?: string | null | undefined;
  /** The side of a record, e.g. 'A'. */
  side?: string | null | undefined;
  title: string;
  trackNumber: number;
};

export type AppsQueryVariables = Exact<{ [key: string]: never; }>;


export type AppsQuery = { me: { username: string, displayName: string | null }, appPasswords: Array<{ id: string, name: string, createdAt: string, lastUsedAt: string | null, expiresAt: string, expired: boolean }>, apiKeys: Array<{ id: string, name: string, createdAt: string, lastUsedAt: string | null }>, settings: { appPasswordExpiryMonths: number } };

export type AppPasswordCreateMutationVariables = Exact<{
  name: string;
}>;


export type AppPasswordCreateMutation = { appPasswordCreate: { password: string, username: string, appPassword: { id: string, name: string } } };

export type AppPasswordRevokeMutationVariables = Exact<{
  id: string | number;
}>;


export type AppPasswordRevokeMutation = { appPasswordRevoke: null | null };

export type ApiKeyCreateMutationVariables = Exact<{
  name: string;
}>;


export type ApiKeyCreateMutation = { apiKeyCreate: { key: string, apiKey: { id: string, name: string } } };

export type ApiKeyRevokeMutationVariables = Exact<{
  id: string | number;
}>;


export type ApiKeyRevokeMutation = { apiKeyRevoke: null | null };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { users: Array<{ id: string, username: string, displayName: string | null, lastSeenAt: string, appPasswordCount: number, apiKeyCount: number, locked: boolean }> };

export type TrashQueryVariables = Exact<{ [key: string]: never; }>;


export type TrashQuery = { trash: { albums: Array<{ id: string, title: string, year: number | null, trashedAt: string | null, trackCount: number }>, tracks: Array<{ id: string, title: string, albumId: string, albumTitle: string, trashedAt: string | null }> } };

export type LibraryStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type LibraryStatusQuery = { libraryStatus: { navidromeAvailable: boolean, scanning: boolean, scanPending: boolean, lastScanAt: string | null, lastScanError: string | null, trackCount: number, listedTrackCount: number } };

export type AuditLogQueryVariables = Exact<{
  page?: number | null | undefined;
  size?: number | null | undefined;
  filter?: AuditFilter | null | undefined;
}>;


export type AuditLogQuery = { auditLog: { totalCount: number, page: number, size: number, entries: Array<{ id: string, at: string, actorId: string, actorName: string | null, action: string, entityType: string, entityId: string | null, summary: string }> } };

export type AuditActorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuditActorsQuery = { auditActors: Array<{ id: string, name: string | null }> };

export type SettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsQuery = { settings: { welcomeSv: string | null, welcomeEn: string | null, appPasswordExpiryMonths: number, lockoutAttempts: number, lockoutMinutes: number } };

export type UserCredentialsRevokeMutationVariables = Exact<{
  userId: string | number;
}>;


export type UserCredentialsRevokeMutation = { userCredentialsRevoke: null | null };

export type UserUnlockMutationVariables = Exact<{
  userId: string | number;
}>;


export type UserUnlockMutation = { userUnlock: null | null };

export type TrashEmptyMutationVariables = Exact<{ [key: string]: never; }>;


export type TrashEmptyMutation = { trashEmpty: null | null };

export type LibraryRescanMutationVariables = Exact<{ [key: string]: never; }>;


export type LibraryRescanMutation = { libraryRescan: null | null };

export type SettingsUpdateMutationVariables = Exact<{
  input: SettingsInput;
}>;


export type SettingsUpdateMutation = { settingsUpdate: { welcomeSv: string | null } };

export type MaintenanceJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type MaintenanceJobsQuery = { maintenanceJobs: Array<{ job: MaintenanceJob, schedule: string | null, running: boolean, lastStartedAt: string | null, lastFinishedAt: string | null, lastSucceeded: boolean | null }> };

export type MaintenanceJobRunMutationVariables = Exact<{
  job: MaintenanceJob;
}>;


export type MaintenanceJobRunMutation = { maintenanceJobRun: boolean };

export type KindFieldsFragment = { id: string, nameSv: string, nameEn: string, isDefault: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { username: string, displayName: string | null, roles: Array<string>, spexflixUser: boolean, archiveUser: boolean }, settings: { welcomeSv: string | null, welcomeEn: string | null, appPasswordExpiryMonths: number, lockoutAttempts: number, lockoutMinutes: number } };

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = { years: Array<number>, recentAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, topAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, categories: Array<{ id: string, name: string, albumCount: number }>, albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, albumKinds: Array<{ albumCount: number, id: string, nameSv: string, nameEn: string, isDefault: boolean }>, thisDayAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, numberKinds: Array<{ id: string, nameSv: string, nameEn: string, trackCount: number, tracks: Array<{ id: string, albumId: string, albumTitle: string, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, durationMs: number, navidromeId: string | null, lyrics: string | null, lyricsSynced: boolean, fileMissing: boolean, spexipediaUrl: string | null, numberTitle: string | null, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> }> };

export type TopQueryVariables = Exact<{
  by: TopBy;
  filter?: AlbumFilter | null | undefined;
  limit?: number | null | undefined;
}>;


export type TopQuery = { years: Array<number>, topAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, topTracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, durationMs: number, listed: boolean, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type AlbumsQueryVariables = Exact<{
  filter?: AlbumFilter | null | undefined;
}>;


export type AlbumsQuery = { years: Array<number>, albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, categories: Array<{ id: string, name: string, albumCount: number }>, albumKinds: Array<{ albumCount: number, id: string, nameSv: string, nameEn: string, isDefault: boolean }> };

export type SpexAlbumsQueryVariables = Exact<{
  filter?: AlbumFilter | null | undefined;
}>;


export type SpexAlbumsQuery = { albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }> };

export type AlbumQueryVariables = Exact<{
  id: string | number;
}>;


export type AlbumQuery = { album: { id: string, title: string, year: number | null, description: string | null, hasCover: boolean, published: boolean, publishedAt: string | null, trashedAt: string | null, navidromeId: string | null, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, catalogueNumber: string | null, released: string | null, recorded: string | null, conductor: string | null, hasBackCover: boolean, createdAt: string, lastModifiedAt: string | null, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, medium: { id: string, nameSv: string, nameEn: string } | null, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }>, collections: Array<{ id: string, title: string }>, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, side: string | null, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string | null, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, numberId: string | null, numberTitle: string | null, spexipediaUrl: string | null, hasAudio: boolean, creditsFromNumber: boolean, numberKind: { id: string, nameSv: string, nameEn: string } | null, credits: Array<{ kindId: string, kindNameSv: string, kindNameEn: string, name: string }>, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null, videoLinks: Array<{ videoId: string, videoTitle: string, chapterTitle: string, startSeconds: number }>, sheetMusic: { archiveUrl: string | null } | null }> } | null };

export type SearchQueryVariables = Exact<{
  q: string;
}>;


export type SearchQuery = { search: { albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string | null, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> } };

export type CollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CollectionsQuery = { collections: Array<{ id: string, title: string, description: string | null, createdAt: string, lastModifiedAt: string | null, albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }> }> };

export type CollectionQueryVariables = Exact<{
  id: string | number;
}>;


export type CollectionQuery = { collection: { id: string, title: string, description: string | null, createdAt: string, lastModifiedAt: string | null, albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }> } | null };

export type CollectionCreateMutationVariables = Exact<{
  input: CollectionInput;
}>;


export type CollectionCreateMutation = { collectionCreate: { id: string } };

export type CollectionUpdateMutationVariables = Exact<{
  id: string | number;
  input: CollectionInput;
}>;


export type CollectionUpdateMutation = { collectionUpdate: { id: string } };

export type CollectionDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type CollectionDeleteMutation = { collectionDelete: null | null };

export type AlbumMediaQueryVariables = Exact<{ [key: string]: never; }>;


export type AlbumMediaQuery = { albumMedia: Array<{ id: string, nameSv: string, nameEn: string, position: number, albumCount: number }> };

export type AlbumMediumCreateMutationVariables = Exact<{
  input: AlbumMediumInput;
}>;


export type AlbumMediumCreateMutation = { albumMediumCreate: { id: string } };

export type AlbumMediumUpdateMutationVariables = Exact<{
  id: string | number;
  input: AlbumMediumInput;
}>;


export type AlbumMediumUpdateMutation = { albumMediumUpdate: { id: string } };

export type AlbumMediaReorderMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;


export type AlbumMediaReorderMutation = { albumMediaReorder: Array<{ id: string }> };

export type AlbumMediumDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumMediumDeleteMutation = { albumMediumDelete: null | null };

export type TrackAddMutationVariables = Exact<{
  albumId: string | number;
  input: TrackInput;
}>;


export type TrackAddMutation = { trackAdd: { id: string } };

export type AlbumBackCoverRemoveMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumBackCoverRemoveMutation = { albumBackCoverRemove: { id: string } };

export type AlbumKindsQueryVariables = Exact<{ [key: string]: never; }>;


export type AlbumKindsQuery = { albumKinds: Array<{ position: number, albumCount: number, id: string, nameSv: string, nameEn: string, isDefault: boolean }> };

export type AlbumsByNavidromeIdsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type AlbumsByNavidromeIdsQuery = { albumsByNavidromeIds: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, navidromeId: string | null, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }> };

export type SpexSearchQueryVariables = Exact<{
  q: string;
}>;


export type SpexSearchQuery = { spexSearch: Array<{ id: string, title: string | null, year: number | null, revival: boolean, parentId: string | null, categoryName: string | null }> };

export type SpexNumbersQueryVariables = Exact<{
  spexId: string | number;
}>;


export type SpexNumbersQuery = { spexNumbers: Array<{ id: string, spexId: string | null, act: number, position: number, title: string }> };

export type TrackSetNumberMutationVariables = Exact<{
  id: string | number;
  numberId?: string | number | null | undefined;
}>;


export type TrackSetNumberMutation = { trackSetNumber: { id: string } };

export type TracksByNavidromeIdsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type TracksByNavidromeIdsQuery = { tracksByNavidromeIds: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string | null, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> };

export type AlbumCreateMutationVariables = Exact<{
  input: AlbumInput;
}>;


export type AlbumCreateMutation = { albumCreate: { id: string } };

export type AlbumUpdateMutationVariables = Exact<{
  id: string | number;
  input: AlbumInput;
}>;


export type AlbumUpdateMutation = { albumUpdate: { id: string } };

export type AlbumPublishMutationVariables = Exact<{
  id: string | number;
  published: boolean;
}>;


export type AlbumPublishMutation = { albumPublish: { id: string, published: boolean } };

export type AlbumTrashMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumTrashMutation = { albumTrash: { id: string } };

export type AlbumRestoreMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumRestoreMutation = { albumRestore: { id: string } };

export type AlbumDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumDeleteMutation = { albumDelete: null | null };

export type AlbumCoverRemoveMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumCoverRemoveMutation = { albumCoverRemove: { id: string, hasCover: boolean } };

export type TracksReorderMutationVariables = Exact<{
  albumId: string | number;
  trackIds: Array<string | number> | string | number;
}>;


export type TracksReorderMutation = { tracksReorder: { id: string } };

export type TrackCreateMutationVariables = Exact<{
  albumId: string | number;
  uploadId: string;
}>;


export type TrackCreateMutation = { trackCreate: { id: string, title: string } };

export type TrackUpdateMutationVariables = Exact<{
  id: string | number;
  input: TrackInput;
}>;


export type TrackUpdateMutation = { trackUpdate: { id: string } };

export type TrackReplaceAudioMutationVariables = Exact<{
  id: string | number;
  uploadId: string;
}>;


export type TrackReplaceAudioMutation = { trackReplaceAudio: { id: string } };

export type TrackPublishMutationVariables = Exact<{
  id: string | number;
  published: boolean;
}>;


export type TrackPublishMutation = { trackPublish: { id: string, published: boolean } };

export type TrackTrashMutationVariables = Exact<{
  id: string | number;
}>;


export type TrackTrashMutation = { trackTrash: { id: string } };

export type TrackRestoreMutationVariables = Exact<{
  id: string | number;
}>;


export type TrackRestoreMutation = { trackRestore: { id: string } };

export type AlbumKindCreateMutationVariables = Exact<{
  input: AlbumKindInput;
}>;


export type AlbumKindCreateMutation = { albumKindCreate: { id: string } };

export type AlbumKindUpdateMutationVariables = Exact<{
  id: string | number;
  input: AlbumKindInput;
}>;


export type AlbumKindUpdateMutation = { albumKindUpdate: { id: string } };

export type AlbumKindsReorderMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;


export type AlbumKindsReorderMutation = { albumKindsReorder: Array<{ id: string }> };

export type AlbumKindDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type AlbumKindDeleteMutation = { albumKindDelete: null | null };

export type CreditsQueryVariables = Exact<{
  kind: CreditKind;
}>;


export type CreditsQuery = { credits: Array<{ name: string, trackCount: number }> };

export type CreditTracksQueryVariables = Exact<{
  kind: CreditKind;
  name: string;
}>;


export type CreditTracksQuery = { creditTracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, durationMs: number, listed: boolean, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> };

export type RadioQueryVariables = Exact<{
  trackId?: string | number | null | undefined;
  albumId?: string | number | null | undefined;
  limit?: number | null | undefined;
}>;


export type RadioQuery = { radio: Array<{ id: string, albumId: string, albumTitle: string, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, durationMs: number, navidromeId: string | null, lyrics: string | null, lyricsSynced: boolean, fileMissing: boolean, spexipediaUrl: string | null, numberTitle: string | null, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> };

export type TrackDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type TrackDeleteMutation = { trackDelete: null | null };

export type ScoreSyncFieldsFragment = { fileId: string, method: ScoreSyncMethod, status: ScoreSyncStatus, quality: number | null, error: string | null, stale: boolean, updatedAt: string | null, version: number | null, points: Array<{ seconds: number, measure: number, beat: number }>, jumps: Array<{ after: number, to: number, nth: number | null }> };

export type TrackStudioQueryVariables = Exact<{
  id: string | number;
}>;


export type TrackStudioQuery = { track: { id: string, sheetMusic: { arrangementId: string, archiveUrl: string | null, versions: Array<{ id: string, label: string, arranger: string | null, recommended: boolean, key: string | null, tempo: string | null, files: Array<{ id: string, title: string, name: string, extension: string, contentType: string, size: number, pages: number | null, roleSv: string, roleEn: string, instrumentsSv: Array<string>, instrumentsEn: Array<string>, desk: string | null, kind: SheetFileKind }> }> } | null, scoreSyncs: Array<{ fileId: string, method: ScoreSyncMethod, status: ScoreSyncStatus, quality: number | null, error: string | null, stale: boolean, updatedAt: string | null, version: number | null, points: Array<{ seconds: number, measure: number, beat: number }>, jumps: Array<{ after: number, to: number, nth: number | null }> }>, singers: Array<{ label: string, name: string }> } | null };

export type LyricsEditorQueryVariables = Exact<{
  id: string | number;
  points: number;
}>;


export type LyricsEditorQuery = { track: { id: string, albumId: string, albumTitle: string, title: string, discNumber: number, trackNumber: number, durationMs: number, lyrics: string | null, lyricsSynced: boolean, fileMissing: boolean, waveform: Array<number>, lyricsRevisions: Array<{ id: string, lyrics: string | null, synced: boolean, createdAt: string, createdBy: string | null }> } | null };

export type TrackLyricsUpdateMutationVariables = Exact<{
  id: string | number;
  lyrics?: string | null | undefined;
  synced: boolean;
  baseRevisionId?: string | number | null | undefined;
}>;


export type TrackLyricsUpdateMutation = { trackLyricsUpdate: { id: string, lyrics: string | null, lyricsSynced: boolean, lyricsRevisions: Array<{ id: string, lyrics: string | null, synced: boolean, createdAt: string, createdBy: string | null }> } };

export type TrackLyricsRestoreMutationVariables = Exact<{
  id: string | number;
  revisionId: string | number;
}>;


export type TrackLyricsRestoreMutation = { trackLyricsRestore: { id: string, lyrics: string | null, lyricsSynced: boolean, lyricsRevisions: Array<{ id: string, lyrics: string | null, synced: boolean, createdAt: string, createdBy: string | null }> } };

export type ScoreSyncSaveMutationVariables = Exact<{
  trackId: string | number;
  fileId: string | number;
  input: ScoreSyncInput;
  version?: number | null | undefined;
}>;


export type ScoreSyncSaveMutation = { scoreSyncSave: { fileId: string, method: ScoreSyncMethod, status: ScoreSyncStatus, quality: number | null, error: string | null, stale: boolean, updatedAt: string | null, version: number | null, points: Array<{ seconds: number, measure: number, beat: number }>, jumps: Array<{ after: number, to: number, nth: number | null }> } };

export type ScoreSyncDeleteMutationVariables = Exact<{
  trackId: string | number;
  fileId: string | number;
}>;


export type ScoreSyncDeleteMutation = { scoreSyncDelete: boolean };

export type ScoreAlignMutationVariables = Exact<{
  trackId: string | number;
  fileId: string | number;
}>;


export type ScoreAlignMutation = { scoreAlign: { fileId: string, method: ScoreSyncMethod, status: ScoreSyncStatus, quality: number | null, error: string | null, stale: boolean, updatedAt: string | null, version: number | null, points: Array<{ seconds: number, measure: number, beat: number }>, jumps: Array<{ after: number, to: number, nth: number | null }> } };

export const KindFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<KindFieldsFragment, unknown>;
export const ScoreSyncFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScoreSyncFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScoreSync"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"stale"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seconds"}},{"kind":"Field","name":{"kind":"Name","value":"measure"}},{"kind":"Field","name":{"kind":"Name","value":"beat"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jumps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"nth"}}]}}]}}]} as unknown as DocumentNode<ScoreSyncFieldsFragment, unknown>;
export const AppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Apps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appPasswords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"apiKeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}}]}}]}}]} as unknown as DocumentNode<AppsQuery, AppsQueryVariables>;
export const AppPasswordCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AppPasswordCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"appPassword"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AppPasswordCreateMutation, AppPasswordCreateMutationVariables>;
export const AppPasswordRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AppPasswordRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AppPasswordRevokeMutation, AppPasswordRevokeMutationVariables>;
export const ApiKeyCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApiKeyCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"apiKey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ApiKeyCreateMutation, ApiKeyCreateMutationVariables>;
export const ApiKeyRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApiKeyRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ApiKeyRevokeMutation, ApiKeyRevokeMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordCount"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyCount"}},{"kind":"Field","name":{"kind":"Name","value":"locked"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const TrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}}]}}]}}]}}]} as unknown as DocumentNode<TrashQuery, TrashQueryVariables>;
export const LibraryStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navidromeAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"scanning"}},{"kind":"Field","name":{"kind":"Name","value":"scanPending"}},{"kind":"Field","name":{"kind":"Name","value":"lastScanAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastScanError"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"listedTrackCount"}}]}}]}}]} as unknown as DocumentNode<LibraryStatusQuery, LibraryStatusQueryVariables>;
export const AuditLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AuditFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"at"}},{"kind":"Field","name":{"kind":"Name","value":"actorId"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}}]}}]}}]}}]} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const AuditActorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditActors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditActors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AuditActorsQuery, AuditActorsQueryVariables>;
export const SettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutMinutes"}}]}}]}}]} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const UserCredentialsRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserCredentialsRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userCredentialsRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UserCredentialsRevokeMutation, UserCredentialsRevokeMutationVariables>;
export const UserUnlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserUnlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userUnlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UserUnlockMutation, UserUnlockMutationVariables>;
export const TrashEmptyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrashEmpty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trashEmpty"}}]}}]} as unknown as DocumentNode<TrashEmptyMutation, TrashEmptyMutationVariables>;
export const LibraryRescanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LibraryRescan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryRescan"}}]}}]} as unknown as DocumentNode<LibraryRescanMutation, LibraryRescanMutationVariables>;
export const SettingsUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settingsUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateMutation, SettingsUpdateMutationVariables>;
export const MaintenanceJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MaintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"lastStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastFinishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSucceeded"}}]}}]}}]} as unknown as DocumentNode<MaintenanceJobsQuery, MaintenanceJobsQueryVariables>;
export const MaintenanceJobRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MaintenanceJobRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"job"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MaintenanceJob"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"job"},"value":{"kind":"Variable","name":{"kind":"Name","value":"job"}}}]}]}}]} as unknown as DocumentNode<MaintenanceJobRunMutation, MaintenanceJobRunMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"spexflixUser"}},{"kind":"Field","name":{"kind":"Name","value":"archiveUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutMinutes"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const HomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"topAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"RATED"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"albumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"thisDayAlbums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"numberKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"16"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"spexipediaUrl"}},{"kind":"Field","name":{"kind":"Name","value":"numberTitle"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<HomeQuery, HomeQueryVariables>;
export const TopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Top"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"by"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TopBy"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"Variable","name":{"kind":"Name","value":"by"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"topTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"Variable","name":{"kind":"Name","value":"by"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<TopQuery, TopQueryVariables>;
export const AlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Albums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}},{"kind":"Field","name":{"kind":"Name","value":"albumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumsQuery, AlbumsQueryVariables>;
export const SpexAlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexAlbums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SpexAlbumsQuery, SpexAlbumsQueryVariables>;
export const AlbumDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Album"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"album"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}},{"kind":"Field","name":{"kind":"Name","value":"medium"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"released"}},{"kind":"Field","name":{"kind":"Name","value":"recorded"}},{"kind":"Field","name":{"kind":"Name","value":"conductor"}},{"kind":"Field","name":{"kind":"Name","value":"hasBackCover"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"numberId"}},{"kind":"Field","name":{"kind":"Name","value":"numberTitle"}},{"kind":"Field","name":{"kind":"Name","value":"spexipediaUrl"}},{"kind":"Field","name":{"kind":"Name","value":"numberKind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasAudio"}},{"kind":"Field","name":{"kind":"Name","value":"creditsFromNumber"}},{"kind":"Field","name":{"kind":"Name","value":"credits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kindId"}},{"kind":"Field","name":{"kind":"Name","value":"kindNameSv"}},{"kind":"Field","name":{"kind":"Name","value":"kindNameEn"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"videoTitle"}},{"kind":"Field","name":{"kind":"Name","value":"chapterTitle"}},{"kind":"Field","name":{"kind":"Name","value":"startSeconds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sheetMusic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveUrl"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumQuery, AlbumQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const CollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CollectionsQuery, CollectionsQueryVariables>;
export const CollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CollectionQuery, CollectionQueryVariables>;
export const CollectionCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CollectionCreateMutation, CollectionCreateMutationVariables>;
export const CollectionUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CollectionUpdateMutation, CollectionUpdateMutationVariables>;
export const CollectionDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<CollectionDeleteMutation, CollectionDeleteMutationVariables>;
export const AlbumMediaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlbumMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}}]}}]} as unknown as DocumentNode<AlbumMediaQuery, AlbumMediaQueryVariables>;
export const AlbumMediumCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumMediumCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumMediumInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumMediumCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumMediumCreateMutation, AlbumMediumCreateMutationVariables>;
export const AlbumMediumUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumMediumUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumMediumInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumMediumUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumMediumUpdateMutation, AlbumMediumUpdateMutationVariables>;
export const AlbumMediaReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumMediaReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumMediaReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumMediaReorderMutation, AlbumMediaReorderMutationVariables>;
export const AlbumMediumDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumMediumDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumMediumDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AlbumMediumDeleteMutation, AlbumMediumDeleteMutationVariables>;
export const TrackAddDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackAdd"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"albumId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackAddMutation, TrackAddMutationVariables>;
export const AlbumBackCoverRemoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumBackCoverRemove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumBackCoverRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumBackCoverRemoveMutation, AlbumBackCoverRemoveMutationVariables>;
export const AlbumKindsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlbumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumKindsQuery, AlbumKindsQueryVariables>;
export const AlbumsByNavidromeIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlbumsByNavidromeIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumsByNavidromeIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumsByNavidromeIdsQuery, AlbumsByNavidromeIdsQueryVariables>;
export const SpexSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]} as unknown as DocumentNode<SpexSearchQuery, SpexSearchQueryVariables>;
export const SpexNumbersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexNumbers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexNumbers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"spexId"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<SpexNumbersQuery, SpexNumbersQueryVariables>;
export const TrackSetNumberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackSetNumber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"numberId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackSetNumber"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"numberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"numberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackSetNumberMutation, TrackSetNumberMutationVariables>;
export const TracksByNavidromeIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TracksByNavidromeIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tracksByNavidromeIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]} as unknown as DocumentNode<TracksByNavidromeIdsQuery, TracksByNavidromeIdsQueryVariables>;
export const AlbumCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumCreateMutation, AlbumCreateMutationVariables>;
export const AlbumUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumUpdateMutation, AlbumUpdateMutationVariables>;
export const AlbumPublishDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumPublish"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"published"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumPublish"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"published"},"value":{"kind":"Variable","name":{"kind":"Name","value":"published"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<AlbumPublishMutation, AlbumPublishMutationVariables>;
export const AlbumTrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumTrash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumTrash"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumTrashMutation, AlbumTrashMutationVariables>;
export const AlbumRestoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumRestore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumRestore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumRestoreMutation, AlbumRestoreMutationVariables>;
export const AlbumDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AlbumDeleteMutation, AlbumDeleteMutationVariables>;
export const AlbumCoverRemoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumCoverRemove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumCoverRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}}]}}]}}]} as unknown as DocumentNode<AlbumCoverRemoveMutation, AlbumCoverRemoveMutationVariables>;
export const TracksReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TracksReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tracksReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"albumId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}}},{"kind":"Argument","name":{"kind":"Name","value":"trackIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TracksReorderMutation, TracksReorderMutationVariables>;
export const TrackCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uploadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"albumId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}}},{"kind":"Argument","name":{"kind":"Name","value":"uploadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uploadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<TrackCreateMutation, TrackCreateMutationVariables>;
export const TrackUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackUpdateMutation, TrackUpdateMutationVariables>;
export const TrackReplaceAudioDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackReplaceAudio"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uploadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackReplaceAudio"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"uploadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uploadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackReplaceAudioMutation, TrackReplaceAudioMutationVariables>;
export const TrackPublishDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackPublish"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"published"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackPublish"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"published"},"value":{"kind":"Variable","name":{"kind":"Name","value":"published"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<TrackPublishMutation, TrackPublishMutationVariables>;
export const TrackTrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackTrash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackTrash"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackTrashMutation, TrackTrashMutationVariables>;
export const TrackRestoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackRestore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackRestore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TrackRestoreMutation, TrackRestoreMutationVariables>;
export const AlbumKindCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumKindCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKindInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKindCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumKindCreateMutation, AlbumKindCreateMutationVariables>;
export const AlbumKindUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumKindUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKindInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKindUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumKindUpdateMutation, AlbumKindUpdateMutationVariables>;
export const AlbumKindsReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumKindsReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKindsReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AlbumKindsReorderMutation, AlbumKindsReorderMutationVariables>;
export const AlbumKindDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AlbumKindDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKindDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AlbumKindDeleteMutation, AlbumKindDeleteMutationVariables>;
export const CreditsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Credits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreditKind"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"credits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}}]}}]} as unknown as DocumentNode<CreditsQuery, CreditsQueryVariables>;
export const CreditTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreditTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreditKind"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"creditTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]} as unknown as DocumentNode<CreditTracksQuery, CreditTracksQueryVariables>;
export const RadioDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Radio"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"radio"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"trackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}}},{"kind":"Argument","name":{"kind":"Name","value":"albumId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"spexipediaUrl"}},{"kind":"Field","name":{"kind":"Name","value":"numberTitle"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]} as unknown as DocumentNode<RadioQuery, RadioQueryVariables>;
export const TrackDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TrackDeleteMutation, TrackDeleteMutationVariables>;
export const TrackStudioDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrackStudio"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"track"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sheetMusic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arrangementId"}},{"kind":"Field","name":{"kind":"Name","value":"archiveUrl"}},{"kind":"Field","name":{"kind":"Name","value":"versions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"recommended"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"tempo"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"extension"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"pages"}},{"kind":"Field","name":{"kind":"Name","value":"roleSv"}},{"kind":"Field","name":{"kind":"Name","value":"roleEn"}},{"kind":"Field","name":{"kind":"Name","value":"instrumentsSv"}},{"kind":"Field","name":{"kind":"Name","value":"instrumentsEn"}},{"kind":"Field","name":{"kind":"Name","value":"desk"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreSyncs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScoreSyncFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"singers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScoreSyncFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScoreSync"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"stale"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seconds"}},{"kind":"Field","name":{"kind":"Name","value":"measure"}},{"kind":"Field","name":{"kind":"Name","value":"beat"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jumps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"nth"}}]}}]}}]} as unknown as DocumentNode<TrackStudioQuery, TrackStudioQueryVariables>;
export const LyricsEditorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LyricsEditor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"points"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"track"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsRevisions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"synced"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"waveform"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"points"},"value":{"kind":"Variable","name":{"kind":"Name","value":"points"}}}]}]}}]}}]} as unknown as DocumentNode<LyricsEditorQuery, LyricsEditorQueryVariables>;
export const TrackLyricsUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackLyricsUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lyrics"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"synced"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseRevisionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackLyricsUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"lyrics"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lyrics"}}},{"kind":"Argument","name":{"kind":"Name","value":"synced"},"value":{"kind":"Variable","name":{"kind":"Name","value":"synced"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseRevisionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseRevisionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsRevisions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"synced"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}}]}}]}}]} as unknown as DocumentNode<TrackLyricsUpdateMutation, TrackLyricsUpdateMutationVariables>;
export const TrackLyricsRestoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackLyricsRestore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"revisionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackLyricsRestore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"revisionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"revisionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsRevisions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"synced"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}}]}}]}}]} as unknown as DocumentNode<TrackLyricsRestoreMutation, TrackLyricsRestoreMutationVariables>;
export const ScoreSyncSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScoreSyncSave"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScoreSyncInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scoreSyncSave"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"trackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScoreSyncFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScoreSyncFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScoreSync"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"stale"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seconds"}},{"kind":"Field","name":{"kind":"Name","value":"measure"}},{"kind":"Field","name":{"kind":"Name","value":"beat"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jumps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"nth"}}]}}]}}]} as unknown as DocumentNode<ScoreSyncSaveMutation, ScoreSyncSaveMutationVariables>;
export const ScoreSyncDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScoreSyncDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scoreSyncDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"trackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}}]}]}}]} as unknown as DocumentNode<ScoreSyncDeleteMutation, ScoreSyncDeleteMutationVariables>;
export const ScoreAlignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScoreAlign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scoreAlign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"trackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScoreSyncFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScoreSyncFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ScoreSync"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileId"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quality"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"stale"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"seconds"}},{"kind":"Field","name":{"kind":"Name","value":"measure"}},{"kind":"Field","name":{"kind":"Name","value":"beat"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jumps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"nth"}}]}}]}}]} as unknown as DocumentNode<ScoreAlignMutation, ScoreAlignMutationVariables>;