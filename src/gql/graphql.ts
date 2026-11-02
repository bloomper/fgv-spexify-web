/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AlbumFilter = {
  categoryId?: string | number | null | undefined;
  /** EDITOR only. */
  includeUnpublished?: boolean | null | undefined;
  spexId?: string | number | null | undefined;
  year?: number | null | undefined;
};

export type AlbumInput = {
  description?: string | null | undefined;
  kind: AlbumKind;
  /** A spex in Spexregister. Without it the album is not about one spex, e.g. a jubilee compilation. */
  spexId?: string | number | null | undefined;
  /** Defaults to the spex title. */
  title?: string | null | undefined;
  /** Defaults to the spex year. */
  year?: number | null | undefined;
};

export type AlbumKind =
  | 'COMPILATION'
  | 'OTHER'
  | 'SHOW'
  | 'STUDIO';

/**
 * A scheduled maintenance job: copying the current spex data from Spexregister (SPEX_REFRESH), and removing uploads that
 * were never used (UPLOAD_CLEANUP).
 */
export type MaintenanceJob =
  | 'SPEX_REFRESH'
  | 'UPLOAD_CLEANUP';

export type SettingsInput = {
  appPasswordExpiryMonths: number;
  lockoutAttempts: number;
  lockoutMinutes: number;
  welcomeEn?: string | null | undefined;
  welcomeSv?: string | null | undefined;
};

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
}>;


export type AuditLogQuery = { auditLog: { totalCount: number, page: number, size: number, entries: Array<{ id: string, at: string, actorName: string | null, action: string, entityType: string, entityId: string | null, summary: string }> } };

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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { username: string, displayName: string | null, roles: Array<string>, spexflixUser: boolean }, settings: { welcomeSv: string | null, welcomeEn: string | null, appPasswordExpiryMonths: number, lockoutAttempts: number, lockoutMinutes: number } };

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = { years: Array<number>, recentAlbums: Array<{ id: string, title: string, year: number | null, kind: AlbumKind, hasCover: boolean, trackCount: number, durationMs: number, spex: { id: string, title: string | null, year: number | null, revival: boolean | null, categoryId: string | null, categoryName: string | null } | null }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type AlbumsQueryVariables = Exact<{
  filter?: AlbumFilter | null | undefined;
}>;


export type AlbumsQuery = { years: Array<number>, albums: Array<{ id: string, title: string, year: number | null, kind: AlbumKind, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, spex: { id: string, title: string | null, year: number | null, revival: boolean | null, categoryId: string | null, categoryName: string | null } | null }>, categories: Array<{ id: string, name: string, albumCount: number }> };

export type AlbumQueryVariables = Exact<{
  id: string | number;
}>;


export type AlbumQuery = { album: { id: string, title: string, year: number | null, kind: AlbumKind, description: string | null, hasCover: boolean, published: boolean, publishedAt: string | null, trashedAt: string | null, navidromeId: string | null, trackCount: number, durationMs: number, createdAt: string, lastModifiedAt: string | null, spex: { id: string, title: string | null, year: number | null, revival: boolean | null, categoryId: string | null, categoryName: string | null } | null, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean, videoLinks: Array<{ videoId: string, videoTitle: string, chapterTitle: string, startSeconds: number }> }> } | null };

export type SearchQueryVariables = Exact<{
  q: string;
}>;


export type SearchQuery = { search: { albums: Array<{ id: string, title: string, year: number | null, kind: AlbumKind, hasCover: boolean, published: boolean, trackCount: number, durationMs: number, spex: { id: string, title: string | null, year: number | null, revival: boolean | null, categoryId: string | null, categoryName: string | null } | null }>, tracks: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean }> } };

export type SpexSearchQueryVariables = Exact<{
  q: string;
}>;


export type SpexSearchQuery = { spexSearch: Array<{ id: string, title: string | null, year: number | null, revival: boolean, categoryName: string | null }> };

export type TracksByNavidromeIdsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type TracksByNavidromeIdsQuery = { tracksByNavidromeIds: Array<{ id: string, albumId: string, albumTitle: string, discNumber: number, trackNumber: number, title: string, performers: string | null, melody: string | null, lyricsAuthor: string | null, arranger: string | null, lyrics: string | null, lyricsSynced: boolean, format: string, fileSize: number, durationMs: number, bitrate: number | null, published: boolean, listed: boolean, trashedAt: string | null, navidromeId: string | null, fileMissing: boolean }> };

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

export type TrackDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type TrackDeleteMutation = { trackDelete: null | null };


export const AppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Apps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appPasswords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"apiKeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}}]}}]}}]} as unknown as DocumentNode<AppsQuery, AppsQueryVariables>;
export const AppPasswordCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AppPasswordCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"appPassword"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AppPasswordCreateMutation, AppPasswordCreateMutationVariables>;
export const AppPasswordRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AppPasswordRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appPasswordRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AppPasswordRevokeMutation, AppPasswordRevokeMutationVariables>;
export const ApiKeyCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApiKeyCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"apiKey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ApiKeyCreateMutation, ApiKeyCreateMutationVariables>;
export const ApiKeyRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApiKeyRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ApiKeyRevokeMutation, ApiKeyRevokeMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordCount"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyCount"}},{"kind":"Field","name":{"kind":"Name","value":"locked"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const TrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}}]}}]}}]}}]} as unknown as DocumentNode<TrashQuery, TrashQueryVariables>;
export const LibraryStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navidromeAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"scanning"}},{"kind":"Field","name":{"kind":"Name","value":"scanPending"}},{"kind":"Field","name":{"kind":"Name","value":"lastScanAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastScanError"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"listedTrackCount"}}]}}]}}]} as unknown as DocumentNode<LibraryStatusQuery, LibraryStatusQueryVariables>;
export const AuditLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"at"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}}]}}]}}]}}]} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const SettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutMinutes"}}]}}]}}]} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const UserCredentialsRevokeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserCredentialsRevoke"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userCredentialsRevoke"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UserCredentialsRevokeMutation, UserCredentialsRevokeMutationVariables>;
export const UserUnlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserUnlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userUnlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UserUnlockMutation, UserUnlockMutationVariables>;
export const TrashEmptyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrashEmpty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trashEmpty"}}]}}]} as unknown as DocumentNode<TrashEmptyMutation, TrashEmptyMutationVariables>;
export const LibraryRescanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LibraryRescan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryRescan"}}]}}]} as unknown as DocumentNode<LibraryRescanMutation, LibraryRescanMutationVariables>;
export const SettingsUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settingsUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateMutation, SettingsUpdateMutationVariables>;
export const MaintenanceJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MaintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"lastStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastFinishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSucceeded"}}]}}]}}]} as unknown as DocumentNode<MaintenanceJobsQuery, MaintenanceJobsQueryVariables>;
export const MaintenanceJobRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MaintenanceJobRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"job"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MaintenanceJob"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"job"},"value":{"kind":"Variable","name":{"kind":"Name","value":"job"}}}]}]}}]} as unknown as DocumentNode<MaintenanceJobRunMutation, MaintenanceJobRunMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"spexflixUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"appPasswordExpiryMonths"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutMinutes"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const HomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}}]} as unknown as DocumentNode<HomeQuery, HomeQueryVariables>;
export const AlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Albums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albumCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"years"}}]}}]} as unknown as DocumentNode<AlbumsQuery, AlbumsQueryVariables>;
export const AlbumDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Album"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"album"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}},{"kind":"Field","name":{"kind":"Name","value":"videoLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"videoTitle"}},{"kind":"Field","name":{"kind":"Name","value":"chapterTitle"}},{"kind":"Field","name":{"kind":"Name","value":"startSeconds"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AlbumQuery, AlbumQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"hasCover"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}}]}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const SpexSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]} as unknown as DocumentNode<SpexSearchQuery, SpexSearchQueryVariables>;
export const TracksByNavidromeIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TracksByNavidromeIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tracksByNavidromeIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"albumId"}},{"kind":"Field","name":{"kind":"Name","value":"albumTitle"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"melody"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"arranger"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyricsSynced"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"bitrate"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"listed"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"navidromeId"}},{"kind":"Field","name":{"kind":"Name","value":"fileMissing"}}]}}]}}]} as unknown as DocumentNode<TracksByNavidromeIdsQuery, TracksByNavidromeIdsQueryVariables>;
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
export const TrackDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TrackDeleteMutation, TrackDeleteMutationVariables>;