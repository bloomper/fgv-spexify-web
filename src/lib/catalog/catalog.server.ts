import "server-only";

import {graphql} from "@/gql";
import {runMutation, runQuery} from "@/lib/graphql.server";
import type {AlbumFilter, AlbumInput, TrackInput} from "@/gql/graphql";

const MeQuery = graphql(`
    query Me {
        me { username displayName roles spexflixUser }
        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }
    }
`);

const HomeQuery = graphql(`
    query Home {
        recentAlbums(limit: 12) {
            id title year kind hasCover trackCount durationMs
            spex { id title year revival categoryId categoryName }
        }
        categories { id name albumCount }
        years
    }
`);

const AlbumsQuery = graphql(`
    query Albums($filter: AlbumFilter) {
        albums(filter: $filter) {
            id title year kind hasCover published trackCount durationMs
            spex { id title year revival categoryId categoryName }
        }
        categories { id name albumCount }
        years
    }
`);

const AlbumQuery = graphql(`
    query Album($id: ID!) {
        album(id: $id) {
            id uuid title year kind description hasCover published publishedAt trashedAt navidromeId trackCount durationMs
            createdAt lastModifiedAt
            spex { id title year revival categoryId categoryName }
            tracks {
                id uuid albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing
                videoLinks { videoId videoTitle chapterTitle startSeconds }
            }
        }
    }
`);

const SearchQuery = graphql(`
    query Search($q: String!) {
        search(q: $q) {
            albums {
                id title year kind hasCover published trackCount durationMs
                spex { id title year revival categoryId categoryName }
            }
            tracks {
                id uuid albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing
            }
        }
    }
`);

const SpexSearchQuery = graphql(`
    query SpexSearch($q: String!) {
        spexSearch(q: $q) { id title year revival categoryName }
    }
`);

const TracksByNavidromeIdsQuery = graphql(`
    query TracksByNavidromeIds($ids: [String!]!) {
        tracksByNavidromeIds(ids: $ids) {
            id uuid albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing
        }
    }
`);

const TracksByIdsQuery = graphql(`
    query TracksByIds($ids: [ID!]!) {
        tracksByIds(ids: $ids) { id title discNumber trackNumber albumId albumTitle spexId }
    }
`);

const AlbumCreateMutation = graphql(`
    mutation AlbumCreate($input: AlbumInput!) { albumCreate(input: $input) { id } }
`);
const AlbumUpdateMutation = graphql(`
    mutation AlbumUpdate($id: ID!, $input: AlbumInput!) { albumUpdate(id: $id, input: $input) { id } }
`);
const AlbumPublishMutation = graphql(`
    mutation AlbumPublish($id: ID!, $published: Boolean!) { albumPublish(id: $id, published: $published) { id published } }
`);
const AlbumTrashMutation = graphql(`
    mutation AlbumTrash($id: ID!) { albumTrash(id: $id) { id } }
`);
const AlbumRestoreMutation = graphql(`
    mutation AlbumRestore($id: ID!) { albumRestore(id: $id) { id } }
`);
const AlbumDeleteMutation = graphql(`
    mutation AlbumDelete($id: ID!) { albumDelete(id: $id) }
`);
const AlbumCoverRemoveMutation = graphql(`
    mutation AlbumCoverRemove($id: ID!) { albumCoverRemove(id: $id) { id hasCover } }
`);
const TracksReorderMutation = graphql(`
    mutation TracksReorder($albumId: ID!, $trackIds: [ID!]!) { tracksReorder(albumId: $albumId, trackIds: $trackIds) { id } }
`);
const TrackCreateMutation = graphql(`
    mutation TrackCreate($albumId: ID!, $uploadId: String!) { trackCreate(albumId: $albumId, uploadId: $uploadId) { id title } }
`);
const TrackUpdateMutation = graphql(`
    mutation TrackUpdate($id: ID!, $input: TrackInput!) { trackUpdate(id: $id, input: $input) { id } }
`);
const TrackReplaceAudioMutation = graphql(`
    mutation TrackReplaceAudio($id: ID!, $uploadId: String!) { trackReplaceAudio(id: $id, uploadId: $uploadId) { id } }
`);
const TrackPublishMutation = graphql(`
    mutation TrackPublish($id: ID!, $published: Boolean!) { trackPublish(id: $id, published: $published) { id published } }
`);
const TrackTrashMutation = graphql(`
    mutation TrackTrash($id: ID!) { trackTrash(id: $id) { id } }
`);
const TrackRestoreMutation = graphql(`
    mutation TrackRestore($id: ID!) { trackRestore(id: $id) { id } }
`);
const TrackDeleteMutation = graphql(`
    mutation TrackDelete($id: ID!) { trackDelete(id: $id) }
`);

export async function getMe() {
    return runQuery(MeQuery, {});
}

export async function getHome() {
    return runQuery(HomeQuery, {});
}

export async function getAlbums(filter: AlbumFilter) {
    return runQuery(AlbumsQuery, {filter});
}

export async function getAlbum(id: string) {
    return (await runQuery(AlbumQuery, {id}))?.album ?? null;
}

export async function search(q: string) {
    return (await runQuery(SearchQuery, {q}))?.search;
}

export async function searchSpex(q: string) {
    return (await runQuery(SpexSearchQuery, {q}))?.spexSearch ?? [];
}

export async function getTracksByNavidromeIds(ids: string[]) {
    return ids.length === 0 ? [] : (await runQuery(TracksByNavidromeIdsQuery, {ids}))?.tracksByNavidromeIds ?? [];
}

export async function getTracksByIds(ids: string[]) {
    return ids.length === 0 ? [] : (await runQuery(TracksByIdsQuery, {ids}))?.tracksByIds ?? [];
}

export const albumCreate = async (input: AlbumInput) => (await runMutation(AlbumCreateMutation, {input}))?.albumCreate;
export const albumUpdate = (id: string, input: AlbumInput) => runMutation(AlbumUpdateMutation, {id, input});
export const albumPublish = (id: string, published: boolean) => runMutation(AlbumPublishMutation, {id, published});
export const albumTrash = (id: string) => runMutation(AlbumTrashMutation, {id});
export const albumRestore = (id: string) => runMutation(AlbumRestoreMutation, {id});
export const albumDelete = (id: string) => runMutation(AlbumDeleteMutation, {id});
export const albumCoverRemove = (id: string) => runMutation(AlbumCoverRemoveMutation, {id});
export const tracksReorder = (albumId: string, trackIds: string[]) => runMutation(TracksReorderMutation, {albumId, trackIds});
export const trackCreate = (albumId: string, uploadId: string) => runMutation(TrackCreateMutation, {albumId, uploadId});
export const trackUpdate = (id: string, input: TrackInput) => runMutation(TrackUpdateMutation, {id, input});
export const trackReplaceAudio = (id: string, uploadId: string) => runMutation(TrackReplaceAudioMutation, {id, uploadId});
export const trackPublish = (id: string, published: boolean) => runMutation(TrackPublishMutation, {id, published});
export const trackTrash = (id: string) => runMutation(TrackTrashMutation, {id});
export const trackRestore = (id: string) => runMutation(TrackRestoreMutation, {id});
export const trackDelete = (id: string) => runMutation(TrackDeleteMutation, {id});

