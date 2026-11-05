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
  description?: string | null | undefined;
  /** An album kind; defaults to the first one for a new album and to the current one for an existing album. */
  kindId?: string | number | null | undefined;
  /** Spex in Spexregister, the main one first, e.g. several for a compilation. Empty when the album is not about any spex, e.g. a jubilee recording. */
  spexIds?: Array<string | number>;
  /** Defaults to the main spex's title; required without a spex. */
  title?: string | null | undefined;
  /** Defaults to the main spex's year. */
  year?: number | null | undefined;
};

export type AlbumKindInput = {
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
 * A scheduled maintenance job: copying the current spex data from Spexregister (SPEX_REFRESH), removing uploads that
 * were never used (UPLOAD_CLEANUP), measuring the loudness of tracks that have none yet, for ReplayGain
 * (LOUDNESS_SCAN), and copying everyone's ratings, likes and plays from Navidrome, for averages and top lists
 * (LISTENING_SYNC).
 */
export type MaintenanceJob =
  | 'LISTENING_SYNC'
  | 'LOUDNESS_SCAN'
  | 'SPEX_REFRESH'
  | 'UPLOAD_CLEANUP';

export type SettingsInput = {
  appPasswordExpiryMonths: number;
  lockoutAttempts: number;
  lockoutMinutes: number;
  welcomeEn?: string | null | undefined;
  welcomeSv?: string | null | undefined;
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


export type MeQuery = { me: { username: string, displayName: string | null, roles: Array<string>, spexflixUser: boolean }, settings: { welcomeSv: string | null, welcomeEn: string | null, appPasswordExpiryMonths: number, lockoutAttempts: number, lockoutMinutes: number } };

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = { years: Array<number>, recentAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, topAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type TopQueryVariables = Exact<{
  by: TopBy;
  filter?: AlbumFilter | null | undefined;
  limit?: number | null | undefined;
}>;


export type TopQuery = { years: Array<number>, topAlbums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, topTracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, durationMs: number, listed: boolean, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type AlbumsQueryVariables = Exact<{
  filter?: AlbumFilter | null | undefined;
}>;


export type AlbumsQuery = { years: Array<number>, albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type SpexAlbumsQueryVariables = Exact<{
  filter?: AlbumFilter | null | undefined;
}>;


export type SpexAlbumsQuery = { albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }> };

export type AlbumQueryVariables = Exact<{
  id: string | number;
}>;


export type AlbumQuery = { album: { id: string, title: string, year: number | null, description: string | null, hasCover: boolean, published: boolean, publishedAt: string | null, trashedAt: string | null, navidromeId: string | null, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, likeCount: number, totalPlays: number, createdAt: string, lastModifiedAt: string | null, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }>, collections: Array<{ id: string, title: string }>, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null, videoLinks: Array<{ videoId: string, videoTitle: string, chapterTitle: string, startSeconds: number }> }> } | null };

export type SearchQueryVariables = Exact<{
  q: string;
}>;


export type SearchQuery = { search: { albums: Array<{ id: string, title: string, year: number | null, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, averageRating: number | null, ratingCount: number, kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }, spex: Array<{ id: string, title: string | null, year: number | null, revival: boolean | null, parentId: string | null, familyId: string, categoryId: string | null, categoryName: string | null }> }>, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> } };

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

export type TracksByNavidromeIdsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type TracksByNavidromeIdsQuery = { tracksByNavidromeIds: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, averageRating: number | null, ratingCount: number, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> };

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


export type RadioQuery = { radio: Array<{ id: string, albumId: string, albumTitle: string, title: string, performers: string | null, durationMs: number, navidromeId: string | null, lyrics: string | null, lyricsSynced: boolean, fileMissing: boolean, replayGain: { trackGain: number, trackPeak: number, albumGain: number | null, albumPeak: number | null } | null }> };

export type TrackDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type TrackDeleteMutation = { trackDelete: null | null };

export const KindFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<KindFieldsFragment, unknown>;
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
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"spexflixUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutMinutes"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const HomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"topAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"EnumValue","value":"RATED"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<HomeQuery, HomeQueryVariables>;
export const TopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Top"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"by"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TopBy"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"Variable","name":{"kind":"Name","value":"by"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"topTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"Variable","name":{"kind":"Name","value":"by"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<TopQuery, TopQueryVariables>;
export const AlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Albums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumsQuery, AlbumsQueryVariables>;
export const SpexAlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexAlbums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SpexAlbumsQuery, SpexAlbumsQueryVariables>;
export const AlbumDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Album"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"album"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPlays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"videoTitle"}},{"kind":"Field","name":{"kind":"Name","value":"chapterTitle"}},{"kind":"Field","name":{"kind":"Name","value":"startSeconds"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumQuery, AlbumQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const CollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CollectionsQuery, CollectionsQueryVariables>;
export const CollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CollectionQuery, CollectionQueryVariables>;
export const CollectionCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CollectionCreateMutation, CollectionCreateMutationVariables>;
export const CollectionUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CollectionUpdateMutation, CollectionUpdateMutationVariables>;
export const CollectionDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CollectionDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collectionDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<CollectionDeleteMutation, CollectionDeleteMutationVariables>;
export const AlbumKindsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlbumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumKinds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumKindsQuery, AlbumKindsQueryVariables>;
export const AlbumsByNavidromeIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlbumsByNavidromeIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albumsByNavidromeIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"KindFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"familyId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"KindFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumKind"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSv"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AlbumsByNavidromeIdsQuery, AlbumsByNavidromeIdsQueryVariables>;
export const SpexSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]} as unknown as DocumentNode<SpexSearchQuery, SpexSearchQueryVariables>;
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
export const RadioDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Radio"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"radio"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"trackId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackId"}}},{"kind":"Argument","name":{"kind":"Name","value":"albumId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"albumId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"replayGain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackGain"}},{"kind":"Field","name":{"kind":"Name","value":"trackPeak"}},{"kind":"Field","name":{"kind":"Name","value":"albumGain"}},{"kind":"Field","name":{"kind":"Name","value":"albumPeak"}}]}}]}}]}}]} as unknown as DocumentNode<RadioQuery, RadioQueryVariables>;
export const TrackDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TrackDeleteMutation, TrackDeleteMutationVariables>;