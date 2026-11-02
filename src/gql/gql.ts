/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query Apps {\n        me { username displayName }\n        appPasswords { id name createdAt lastUsedAt expiresAt expired }\n        apiKeys { id name createdAt lastUsedAt }\n        settings { appPasswordExpiryMonths }\n    }\n": typeof types.AppsDocument,
    "\n    mutation AppPasswordCreate($name: String!) {\n        appPasswordCreate(name: $name) { password username appPassword { id name } }\n    }\n": typeof types.AppPasswordCreateDocument,
    "\n    mutation AppPasswordRevoke($id: ID!) { appPasswordRevoke(id: $id) }\n": typeof types.AppPasswordRevokeDocument,
    "\n    mutation ApiKeyCreate($name: String!) { apiKeyCreate(name: $name) { key apiKey { id name } } }\n": typeof types.ApiKeyCreateDocument,
    "\n    mutation ApiKeyRevoke($id: ID!) { apiKeyRevoke(id: $id) }\n": typeof types.ApiKeyRevokeDocument,
    "\n    query Users {\n        users { id username displayName lastSeenAt appPasswordCount apiKeyCount locked }\n    }\n": typeof types.UsersDocument,
    "\n    query Trash {\n        trash {\n            albums { id title year trashedAt trackCount }\n            tracks { id title albumId albumTitle trashedAt }\n        }\n    }\n": typeof types.TrashDocument,
    "\n    query LibraryStatus {\n        libraryStatus { navidromeAvailable scanning scanPending lastScanAt lastScanError trackCount listedTrackCount }\n    }\n": typeof types.LibraryStatusDocument,
    "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": typeof types.AuditLogDocument,
    "\n    query AuditActors { auditActors { id name } }\n": typeof types.AuditActorsDocument,
    "\n    query Settings { settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes } }\n": typeof types.SettingsDocument,
    "mutation UserCredentialsRevoke($userId: ID!) { userCredentialsRevoke(userId: $userId) }": typeof types.UserCredentialsRevokeDocument,
    "mutation UserUnlock($userId: ID!) { userUnlock(userId: $userId) }": typeof types.UserUnlockDocument,
    "mutation TrashEmpty { trashEmpty }": typeof types.TrashEmptyDocument,
    "mutation LibraryRescan { libraryRescan }": typeof types.LibraryRescanDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": typeof types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": typeof types.MaintenanceJobsDocument,
    "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": typeof types.MaintenanceJobRunDocument,
    "\n    fragment KindFields on AlbumKind { id nameSv nameEn isDefault }\n": typeof types.KindFieldsFragmentDoc,
    "\n    query Me {\n        me { username displayName roles spexflixUser }\n        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }\n    }\n": typeof types.MeDocument,
    "\n    query Home {\n        recentAlbums(limit: 12) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n": typeof types.HomeDocument,
    "\n    query Albums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n": typeof types.AlbumsDocument,
    "\n    query SpexAlbums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n": typeof types.SpexAlbumsDocument,
    "\n    query Album($id: ID!) {\n        album(id: $id) {\n            id title year kind { ...KindFields } description hasCover published publishedAt trashedAt navidromeId trackCount durationMs\n            createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n                videoLinks { videoId videoTitle chapterTitle startSeconds }\n            }\n        }\n    }\n": typeof types.AlbumDocument,
    "\n    query Search($q: String!) {\n        search(q: $q) {\n            albums {\n                id title year kind { ...KindFields } hasCover published trackCount durationMs\n                spex { id title year revival parentId familyId categoryId categoryName }\n            }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n            }\n        }\n    }\n": typeof types.SearchDocument,
    "\n    query AlbumKinds {\n        albumKinds { ...KindFields position albumCount }\n    }\n": typeof types.AlbumKindsDocument,
    "\n    query AlbumsByNavidromeIds($ids: [String!]!) {\n        albumsByNavidromeIds(ids: $ids) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs navidromeId\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n": typeof types.AlbumsByNavidromeIdsDocument,
    "\n    query SpexSearch($q: String!) {\n        spexSearch(q: $q) { id title year revival parentId categoryName }\n    }\n": typeof types.SpexSearchDocument,
    "\n    query TracksByNavidromeIds($ids: [String!]!) {\n        tracksByNavidromeIds(ids: $ids) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": typeof types.TracksByNavidromeIdsDocument,
    "\n    mutation AlbumCreate($input: AlbumInput!) { albumCreate(input: $input) { id } }\n": typeof types.AlbumCreateDocument,
    "\n    mutation AlbumUpdate($id: ID!, $input: AlbumInput!) { albumUpdate(id: $id, input: $input) { id } }\n": typeof types.AlbumUpdateDocument,
    "\n    mutation AlbumPublish($id: ID!, $published: Boolean!) { albumPublish(id: $id, published: $published) { id published } }\n": typeof types.AlbumPublishDocument,
    "\n    mutation AlbumTrash($id: ID!) { albumTrash(id: $id) { id } }\n": typeof types.AlbumTrashDocument,
    "\n    mutation AlbumRestore($id: ID!) { albumRestore(id: $id) { id } }\n": typeof types.AlbumRestoreDocument,
    "\n    mutation AlbumDelete($id: ID!) { albumDelete(id: $id) }\n": typeof types.AlbumDeleteDocument,
    "\n    mutation AlbumCoverRemove($id: ID!) { albumCoverRemove(id: $id) { id hasCover } }\n": typeof types.AlbumCoverRemoveDocument,
    "\n    mutation TracksReorder($albumId: ID!, $trackIds: [ID!]!) { tracksReorder(albumId: $albumId, trackIds: $trackIds) { id } }\n": typeof types.TracksReorderDocument,
    "\n    mutation TrackCreate($albumId: ID!, $uploadId: String!) { trackCreate(albumId: $albumId, uploadId: $uploadId) { id title } }\n": typeof types.TrackCreateDocument,
    "\n    mutation TrackUpdate($id: ID!, $input: TrackInput!) { trackUpdate(id: $id, input: $input) { id } }\n": typeof types.TrackUpdateDocument,
    "\n    mutation TrackReplaceAudio($id: ID!, $uploadId: String!) { trackReplaceAudio(id: $id, uploadId: $uploadId) { id } }\n": typeof types.TrackReplaceAudioDocument,
    "\n    mutation TrackPublish($id: ID!, $published: Boolean!) { trackPublish(id: $id, published: $published) { id published } }\n": typeof types.TrackPublishDocument,
    "\n    mutation TrackTrash($id: ID!) { trackTrash(id: $id) { id } }\n": typeof types.TrackTrashDocument,
    "\n    mutation TrackRestore($id: ID!) { trackRestore(id: $id) { id } }\n": typeof types.TrackRestoreDocument,
    "\n    mutation AlbumKindCreate($input: AlbumKindInput!) { albumKindCreate(input: $input) { id } }\n": typeof types.AlbumKindCreateDocument,
    "\n    mutation AlbumKindUpdate($id: ID!, $input: AlbumKindInput!) { albumKindUpdate(id: $id, input: $input) { id } }\n": typeof types.AlbumKindUpdateDocument,
    "\n    mutation AlbumKindsReorder($ids: [ID!]!) { albumKindsReorder(ids: $ids) { id } }\n": typeof types.AlbumKindsReorderDocument,
    "\n    mutation AlbumKindDelete($id: ID!) { albumKindDelete(id: $id) }\n": typeof types.AlbumKindDeleteDocument,
    "\n    query Credits($kind: CreditKind!) {\n        credits(kind: $kind) { name trackCount }\n    }\n": typeof types.CreditsDocument,
    "\n    query CreditTracks($kind: CreditKind!, $name: String!) {\n        creditTracks(kind: $kind, name: $name) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced durationMs listed navidromeId fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": typeof types.CreditTracksDocument,
    "\n    query Radio($trackId: ID, $albumId: ID, $limit: Int) {\n        radio(trackId: $trackId, albumId: $albumId, limit: $limit) {\n            id albumId albumTitle title performers durationMs navidromeId lyrics lyricsSynced fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": typeof types.RadioDocument,
    "\n    mutation TrackDelete($id: ID!) { trackDelete(id: $id) }\n": typeof types.TrackDeleteDocument,
};
const documents: Documents = {
    "\n    query Apps {\n        me { username displayName }\n        appPasswords { id name createdAt lastUsedAt expiresAt expired }\n        apiKeys { id name createdAt lastUsedAt }\n        settings { appPasswordExpiryMonths }\n    }\n": types.AppsDocument,
    "\n    mutation AppPasswordCreate($name: String!) {\n        appPasswordCreate(name: $name) { password username appPassword { id name } }\n    }\n": types.AppPasswordCreateDocument,
    "\n    mutation AppPasswordRevoke($id: ID!) { appPasswordRevoke(id: $id) }\n": types.AppPasswordRevokeDocument,
    "\n    mutation ApiKeyCreate($name: String!) { apiKeyCreate(name: $name) { key apiKey { id name } } }\n": types.ApiKeyCreateDocument,
    "\n    mutation ApiKeyRevoke($id: ID!) { apiKeyRevoke(id: $id) }\n": types.ApiKeyRevokeDocument,
    "\n    query Users {\n        users { id username displayName lastSeenAt appPasswordCount apiKeyCount locked }\n    }\n": types.UsersDocument,
    "\n    query Trash {\n        trash {\n            albums { id title year trashedAt trackCount }\n            tracks { id title albumId albumTitle trashedAt }\n        }\n    }\n": types.TrashDocument,
    "\n    query LibraryStatus {\n        libraryStatus { navidromeAvailable scanning scanPending lastScanAt lastScanError trackCount listedTrackCount }\n    }\n": types.LibraryStatusDocument,
    "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": types.AuditLogDocument,
    "\n    query AuditActors { auditActors { id name } }\n": types.AuditActorsDocument,
    "\n    query Settings { settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes } }\n": types.SettingsDocument,
    "mutation UserCredentialsRevoke($userId: ID!) { userCredentialsRevoke(userId: $userId) }": types.UserCredentialsRevokeDocument,
    "mutation UserUnlock($userId: ID!) { userUnlock(userId: $userId) }": types.UserUnlockDocument,
    "mutation TrashEmpty { trashEmpty }": types.TrashEmptyDocument,
    "mutation LibraryRescan { libraryRescan }": types.LibraryRescanDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": types.MaintenanceJobsDocument,
    "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": types.MaintenanceJobRunDocument,
    "\n    fragment KindFields on AlbumKind { id nameSv nameEn isDefault }\n": types.KindFieldsFragmentDoc,
    "\n    query Me {\n        me { username displayName roles spexflixUser }\n        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }\n    }\n": types.MeDocument,
    "\n    query Home {\n        recentAlbums(limit: 12) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n": types.HomeDocument,
    "\n    query Albums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n": types.AlbumsDocument,
    "\n    query SpexAlbums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n": types.SpexAlbumsDocument,
    "\n    query Album($id: ID!) {\n        album(id: $id) {\n            id title year kind { ...KindFields } description hasCover published publishedAt trashedAt navidromeId trackCount durationMs\n            createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n                videoLinks { videoId videoTitle chapterTitle startSeconds }\n            }\n        }\n    }\n": types.AlbumDocument,
    "\n    query Search($q: String!) {\n        search(q: $q) {\n            albums {\n                id title year kind { ...KindFields } hasCover published trackCount durationMs\n                spex { id title year revival parentId familyId categoryId categoryName }\n            }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n            }\n        }\n    }\n": types.SearchDocument,
    "\n    query AlbumKinds {\n        albumKinds { ...KindFields position albumCount }\n    }\n": types.AlbumKindsDocument,
    "\n    query AlbumsByNavidromeIds($ids: [String!]!) {\n        albumsByNavidromeIds(ids: $ids) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs navidromeId\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n": types.AlbumsByNavidromeIdsDocument,
    "\n    query SpexSearch($q: String!) {\n        spexSearch(q: $q) { id title year revival parentId categoryName }\n    }\n": types.SpexSearchDocument,
    "\n    query TracksByNavidromeIds($ids: [String!]!) {\n        tracksByNavidromeIds(ids: $ids) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": types.TracksByNavidromeIdsDocument,
    "\n    mutation AlbumCreate($input: AlbumInput!) { albumCreate(input: $input) { id } }\n": types.AlbumCreateDocument,
    "\n    mutation AlbumUpdate($id: ID!, $input: AlbumInput!) { albumUpdate(id: $id, input: $input) { id } }\n": types.AlbumUpdateDocument,
    "\n    mutation AlbumPublish($id: ID!, $published: Boolean!) { albumPublish(id: $id, published: $published) { id published } }\n": types.AlbumPublishDocument,
    "\n    mutation AlbumTrash($id: ID!) { albumTrash(id: $id) { id } }\n": types.AlbumTrashDocument,
    "\n    mutation AlbumRestore($id: ID!) { albumRestore(id: $id) { id } }\n": types.AlbumRestoreDocument,
    "\n    mutation AlbumDelete($id: ID!) { albumDelete(id: $id) }\n": types.AlbumDeleteDocument,
    "\n    mutation AlbumCoverRemove($id: ID!) { albumCoverRemove(id: $id) { id hasCover } }\n": types.AlbumCoverRemoveDocument,
    "\n    mutation TracksReorder($albumId: ID!, $trackIds: [ID!]!) { tracksReorder(albumId: $albumId, trackIds: $trackIds) { id } }\n": types.TracksReorderDocument,
    "\n    mutation TrackCreate($albumId: ID!, $uploadId: String!) { trackCreate(albumId: $albumId, uploadId: $uploadId) { id title } }\n": types.TrackCreateDocument,
    "\n    mutation TrackUpdate($id: ID!, $input: TrackInput!) { trackUpdate(id: $id, input: $input) { id } }\n": types.TrackUpdateDocument,
    "\n    mutation TrackReplaceAudio($id: ID!, $uploadId: String!) { trackReplaceAudio(id: $id, uploadId: $uploadId) { id } }\n": types.TrackReplaceAudioDocument,
    "\n    mutation TrackPublish($id: ID!, $published: Boolean!) { trackPublish(id: $id, published: $published) { id published } }\n": types.TrackPublishDocument,
    "\n    mutation TrackTrash($id: ID!) { trackTrash(id: $id) { id } }\n": types.TrackTrashDocument,
    "\n    mutation TrackRestore($id: ID!) { trackRestore(id: $id) { id } }\n": types.TrackRestoreDocument,
    "\n    mutation AlbumKindCreate($input: AlbumKindInput!) { albumKindCreate(input: $input) { id } }\n": types.AlbumKindCreateDocument,
    "\n    mutation AlbumKindUpdate($id: ID!, $input: AlbumKindInput!) { albumKindUpdate(id: $id, input: $input) { id } }\n": types.AlbumKindUpdateDocument,
    "\n    mutation AlbumKindsReorder($ids: [ID!]!) { albumKindsReorder(ids: $ids) { id } }\n": types.AlbumKindsReorderDocument,
    "\n    mutation AlbumKindDelete($id: ID!) { albumKindDelete(id: $id) }\n": types.AlbumKindDeleteDocument,
    "\n    query Credits($kind: CreditKind!) {\n        credits(kind: $kind) { name trackCount }\n    }\n": types.CreditsDocument,
    "\n    query CreditTracks($kind: CreditKind!, $name: String!) {\n        creditTracks(kind: $kind, name: $name) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced durationMs listed navidromeId fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": types.CreditTracksDocument,
    "\n    query Radio($trackId: ID, $albumId: ID, $limit: Int) {\n        radio(trackId: $trackId, albumId: $albumId, limit: $limit) {\n            id albumId albumTitle title performers durationMs navidromeId lyrics lyricsSynced fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n": types.RadioDocument,
    "\n    mutation TrackDelete($id: ID!) { trackDelete(id: $id) }\n": types.TrackDeleteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Apps {\n        me { username displayName }\n        appPasswords { id name createdAt lastUsedAt expiresAt expired }\n        apiKeys { id name createdAt lastUsedAt }\n        settings { appPasswordExpiryMonths }\n    }\n"): (typeof documents)["\n    query Apps {\n        me { username displayName }\n        appPasswords { id name createdAt lastUsedAt expiresAt expired }\n        apiKeys { id name createdAt lastUsedAt }\n        settings { appPasswordExpiryMonths }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AppPasswordCreate($name: String!) {\n        appPasswordCreate(name: $name) { password username appPassword { id name } }\n    }\n"): (typeof documents)["\n    mutation AppPasswordCreate($name: String!) {\n        appPasswordCreate(name: $name) { password username appPassword { id name } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AppPasswordRevoke($id: ID!) { appPasswordRevoke(id: $id) }\n"): (typeof documents)["\n    mutation AppPasswordRevoke($id: ID!) { appPasswordRevoke(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ApiKeyCreate($name: String!) { apiKeyCreate(name: $name) { key apiKey { id name } } }\n"): (typeof documents)["\n    mutation ApiKeyCreate($name: String!) { apiKeyCreate(name: $name) { key apiKey { id name } } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ApiKeyRevoke($id: ID!) { apiKeyRevoke(id: $id) }\n"): (typeof documents)["\n    mutation ApiKeyRevoke($id: ID!) { apiKeyRevoke(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Users {\n        users { id username displayName lastSeenAt appPasswordCount apiKeyCount locked }\n    }\n"): (typeof documents)["\n    query Users {\n        users { id username displayName lastSeenAt appPasswordCount apiKeyCount locked }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Trash {\n        trash {\n            albums { id title year trashedAt trackCount }\n            tracks { id title albumId albumTitle trashedAt }\n        }\n    }\n"): (typeof documents)["\n    query Trash {\n        trash {\n            albums { id title year trashedAt trackCount }\n            tracks { id title albumId albumTitle trashedAt }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query LibraryStatus {\n        libraryStatus { navidromeAvailable scanning scanPending lastScanAt lastScanError trackCount listedTrackCount }\n    }\n"): (typeof documents)["\n    query LibraryStatus {\n        libraryStatus { navidromeAvailable scanning scanPending lastScanAt lastScanError trackCount listedTrackCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"): (typeof documents)["\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditActors { auditActors { id name } }\n"): (typeof documents)["\n    query AuditActors { auditActors { id name } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Settings { settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes } }\n"): (typeof documents)["\n    query Settings { settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UserCredentialsRevoke($userId: ID!) { userCredentialsRevoke(userId: $userId) }"): (typeof documents)["mutation UserCredentialsRevoke($userId: ID!) { userCredentialsRevoke(userId: $userId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UserUnlock($userId: ID!) { userUnlock(userId: $userId) }"): (typeof documents)["mutation UserUnlock($userId: ID!) { userUnlock(userId: $userId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TrashEmpty { trashEmpty }"): (typeof documents)["mutation TrashEmpty { trashEmpty }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation LibraryRescan { libraryRescan }"): (typeof documents)["mutation LibraryRescan { libraryRescan }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n"): (typeof documents)["\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"): (typeof documents)["\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }"): (typeof documents)["mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment KindFields on AlbumKind { id nameSv nameEn isDefault }\n"): (typeof documents)["\n    fragment KindFields on AlbumKind { id nameSv nameEn isDefault }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me { username displayName roles spexflixUser }\n        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }\n    }\n"): (typeof documents)["\n    query Me {\n        me { username displayName roles spexflixUser }\n        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Home {\n        recentAlbums(limit: 12) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n"): (typeof documents)["\n    query Home {\n        recentAlbums(limit: 12) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Albums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n"): (typeof documents)["\n    query Albums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n        categories { id name albumCount }\n        years\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexAlbums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n"): (typeof documents)["\n    query SpexAlbums($filter: AlbumFilter) {\n        albums(filter: $filter) {\n            id title year kind { ...KindFields } hasCover published trackCount durationMs\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Album($id: ID!) {\n        album(id: $id) {\n            id title year kind { ...KindFields } description hasCover published publishedAt trashedAt navidromeId trackCount durationMs\n            createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n                videoLinks { videoId videoTitle chapterTitle startSeconds }\n            }\n        }\n    }\n"): (typeof documents)["\n    query Album($id: ID!) {\n        album(id: $id) {\n            id title year kind { ...KindFields } description hasCover published publishedAt trashedAt navidromeId trackCount durationMs\n            createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n                videoLinks { videoId videoTitle chapterTitle startSeconds }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Search($q: String!) {\n        search(q: $q) {\n            albums {\n                id title year kind { ...KindFields } hasCover published trackCount durationMs\n                spex { id title year revival parentId familyId categoryId categoryName }\n            }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n            }\n        }\n    }\n"): (typeof documents)["\n    query Search($q: String!) {\n        search(q: $q) {\n            albums {\n                id title year kind { ...KindFields } hasCover published trackCount durationMs\n                spex { id title year revival parentId familyId categoryId categoryName }\n            }\n            tracks {\n                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AlbumKinds {\n        albumKinds { ...KindFields position albumCount }\n    }\n"): (typeof documents)["\n    query AlbumKinds {\n        albumKinds { ...KindFields position albumCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AlbumsByNavidromeIds($ids: [String!]!) {\n        albumsByNavidromeIds(ids: $ids) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs navidromeId\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n"): (typeof documents)["\n    query AlbumsByNavidromeIds($ids: [String!]!) {\n        albumsByNavidromeIds(ids: $ids) {\n            id title year kind { ...KindFields } hasCover trackCount durationMs navidromeId\n            spex { id title year revival parentId familyId categoryId categoryName }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($q: String!) {\n        spexSearch(q: $q) { id title year revival parentId categoryName }\n    }\n"): (typeof documents)["\n    query SpexSearch($q: String!) {\n        spexSearch(q: $q) { id title year revival parentId categoryName }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query TracksByNavidromeIds($ids: [String!]!) {\n        tracksByNavidromeIds(ids: $ids) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"): (typeof documents)["\n    query TracksByNavidromeIds($ids: [String!]!) {\n        tracksByNavidromeIds(ids: $ids) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing\n                replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumCreate($input: AlbumInput!) { albumCreate(input: $input) { id } }\n"): (typeof documents)["\n    mutation AlbumCreate($input: AlbumInput!) { albumCreate(input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumUpdate($id: ID!, $input: AlbumInput!) { albumUpdate(id: $id, input: $input) { id } }\n"): (typeof documents)["\n    mutation AlbumUpdate($id: ID!, $input: AlbumInput!) { albumUpdate(id: $id, input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumPublish($id: ID!, $published: Boolean!) { albumPublish(id: $id, published: $published) { id published } }\n"): (typeof documents)["\n    mutation AlbumPublish($id: ID!, $published: Boolean!) { albumPublish(id: $id, published: $published) { id published } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumTrash($id: ID!) { albumTrash(id: $id) { id } }\n"): (typeof documents)["\n    mutation AlbumTrash($id: ID!) { albumTrash(id: $id) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumRestore($id: ID!) { albumRestore(id: $id) { id } }\n"): (typeof documents)["\n    mutation AlbumRestore($id: ID!) { albumRestore(id: $id) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumDelete($id: ID!) { albumDelete(id: $id) }\n"): (typeof documents)["\n    mutation AlbumDelete($id: ID!) { albumDelete(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumCoverRemove($id: ID!) { albumCoverRemove(id: $id) { id hasCover } }\n"): (typeof documents)["\n    mutation AlbumCoverRemove($id: ID!) { albumCoverRemove(id: $id) { id hasCover } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TracksReorder($albumId: ID!, $trackIds: [ID!]!) { tracksReorder(albumId: $albumId, trackIds: $trackIds) { id } }\n"): (typeof documents)["\n    mutation TracksReorder($albumId: ID!, $trackIds: [ID!]!) { tracksReorder(albumId: $albumId, trackIds: $trackIds) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackCreate($albumId: ID!, $uploadId: String!) { trackCreate(albumId: $albumId, uploadId: $uploadId) { id title } }\n"): (typeof documents)["\n    mutation TrackCreate($albumId: ID!, $uploadId: String!) { trackCreate(albumId: $albumId, uploadId: $uploadId) { id title } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackUpdate($id: ID!, $input: TrackInput!) { trackUpdate(id: $id, input: $input) { id } }\n"): (typeof documents)["\n    mutation TrackUpdate($id: ID!, $input: TrackInput!) { trackUpdate(id: $id, input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackReplaceAudio($id: ID!, $uploadId: String!) { trackReplaceAudio(id: $id, uploadId: $uploadId) { id } }\n"): (typeof documents)["\n    mutation TrackReplaceAudio($id: ID!, $uploadId: String!) { trackReplaceAudio(id: $id, uploadId: $uploadId) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackPublish($id: ID!, $published: Boolean!) { trackPublish(id: $id, published: $published) { id published } }\n"): (typeof documents)["\n    mutation TrackPublish($id: ID!, $published: Boolean!) { trackPublish(id: $id, published: $published) { id published } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackTrash($id: ID!) { trackTrash(id: $id) { id } }\n"): (typeof documents)["\n    mutation TrackTrash($id: ID!) { trackTrash(id: $id) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackRestore($id: ID!) { trackRestore(id: $id) { id } }\n"): (typeof documents)["\n    mutation TrackRestore($id: ID!) { trackRestore(id: $id) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumKindCreate($input: AlbumKindInput!) { albumKindCreate(input: $input) { id } }\n"): (typeof documents)["\n    mutation AlbumKindCreate($input: AlbumKindInput!) { albumKindCreate(input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumKindUpdate($id: ID!, $input: AlbumKindInput!) { albumKindUpdate(id: $id, input: $input) { id } }\n"): (typeof documents)["\n    mutation AlbumKindUpdate($id: ID!, $input: AlbumKindInput!) { albumKindUpdate(id: $id, input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumKindsReorder($ids: [ID!]!) { albumKindsReorder(ids: $ids) { id } }\n"): (typeof documents)["\n    mutation AlbumKindsReorder($ids: [ID!]!) { albumKindsReorder(ids: $ids) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AlbumKindDelete($id: ID!) { albumKindDelete(id: $id) }\n"): (typeof documents)["\n    mutation AlbumKindDelete($id: ID!) { albumKindDelete(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Credits($kind: CreditKind!) {\n        credits(kind: $kind) { name trackCount }\n    }\n"): (typeof documents)["\n    query Credits($kind: CreditKind!) {\n        credits(kind: $kind) { name trackCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query CreditTracks($kind: CreditKind!, $name: String!) {\n        creditTracks(kind: $kind, name: $name) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced durationMs listed navidromeId fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"): (typeof documents)["\n    query CreditTracks($kind: CreditKind!, $name: String!) {\n        creditTracks(kind: $kind, name: $name) {\n            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics\n            lyricsSynced durationMs listed navidromeId fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Radio($trackId: ID, $albumId: ID, $limit: Int) {\n        radio(trackId: $trackId, albumId: $albumId, limit: $limit) {\n            id albumId albumTitle title performers durationMs navidromeId lyrics lyricsSynced fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"): (typeof documents)["\n    query Radio($trackId: ID, $albumId: ID, $limit: Int) {\n        radio(trackId: $trackId, albumId: $albumId, limit: $limit) {\n            id albumId albumTitle title performers durationMs navidromeId lyrics lyricsSynced fileMissing\n            replayGain { trackGain trackPeak albumGain albumPeak }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TrackDelete($id: ID!) { trackDelete(id: $id) }\n"): (typeof documents)["\n    mutation TrackDelete($id: ID!) { trackDelete(id: $id) }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;