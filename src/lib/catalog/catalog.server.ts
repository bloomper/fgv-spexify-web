import "server-only";

import {graphql} from "@/gql";
import {runMutation, runQuery} from "@/lib/graphql.server";
import type {AlbumFilter, AlbumInput, AlbumKindInput, CreditKind, TopBy, TrackInput} from "@/gql/graphql";

export const KindFieldsFragment = graphql(`
    fragment KindFields on AlbumKind { id nameSv nameEn isDefault }
`);

const MeQuery = graphql(`
    query Me {
        me { username displayName roles spexflixUser }
        settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes }
    }
`);

const HomeQuery = graphql(`
    query Home {
        recentAlbums(limit: 12) {
            id title year kind { ...KindFields } hasCover trackCount durationMs averageRating ratingCount
            spex { id title year revival parentId familyId categoryId categoryName }
        }
        topAlbums(by: RATED, limit: 6) {
            id title year kind { ...KindFields } hasCover trackCount durationMs averageRating ratingCount
            spex { id title year revival parentId familyId categoryId categoryName }
        }
        categories { id name albumCount }
        years
    }
`);

const TopQuery = graphql(`
    query Top($by: TopBy!, $filter: AlbumFilter, $limit: Int) {
        topAlbums(by: $by, filter: $filter, limit: $limit) {
            id title year kind { ...KindFields } hasCover trackCount durationMs averageRating ratingCount likeCount totalPlays
            spex { id title year revival parentId familyId categoryId categoryName }
        }
        topTracks(by: $by, filter: $filter, limit: $limit) {
            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
            lyricsSynced durationMs listed navidromeId fileMissing averageRating ratingCount likeCount totalPlays
            replayGain { trackGain trackPeak albumGain albumPeak }
        }
        categories { id name albumCount }
        years
    }
`);

const AlbumsQuery = graphql(`
    query Albums($filter: AlbumFilter) {
        albums(filter: $filter) {
            id title year kind { ...KindFields } hasCover published trackCount durationMs averageRating ratingCount
            spex { id title year revival parentId familyId categoryId categoryName }
        }
        categories { id name albumCount }
        years
    }
`);

const SpexAlbumsQuery = graphql(`
    query SpexAlbums($filter: AlbumFilter) {
        albums(filter: $filter) {
            id title year kind { ...KindFields } hasCover published trackCount durationMs averageRating ratingCount
            spex { id title year revival parentId familyId categoryId categoryName }
        }
    }
`);

const AlbumQuery = graphql(`
    query Album($id: ID!) {
        album(id: $id) {
            id title year kind { ...KindFields } description hasCover published publishedAt trashedAt navidromeId trackCount durationMs
            averageRating ratingCount likeCount totalPlays
            createdAt lastModifiedAt
            spex { id title year revival parentId familyId categoryId categoryName }
            tracks {
                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing averageRating ratingCount
                replayGain { trackGain trackPeak albumGain albumPeak }
                videoLinks { videoId videoTitle chapterTitle startSeconds }
            }
        }
    }
`);

const SearchQuery = graphql(`
    query Search($q: String!) {
        search(q: $q) {
            albums {
                id title year kind { ...KindFields } hasCover published trackCount durationMs averageRating ratingCount
                spex { id title year revival parentId familyId categoryId categoryName }
            }
            tracks {
                id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
                lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing averageRating ratingCount
                replayGain { trackGain trackPeak albumGain albumPeak }
            }
        }
    }
`);

const AlbumKindsQuery = graphql(`
    query AlbumKinds {
        albumKinds { ...KindFields position albumCount }
    }
`);

const AlbumsByNavidromeIdsQuery = graphql(`
    query AlbumsByNavidromeIds($ids: [String!]!) {
        albumsByNavidromeIds(ids: $ids) {
            id title year kind { ...KindFields } hasCover trackCount durationMs navidromeId averageRating ratingCount
            spex { id title year revival parentId familyId categoryId categoryName }
        }
    }
`);

const SpexSearchQuery = graphql(`
    query SpexSearch($q: String!) {
        spexSearch(q: $q) { id title year revival parentId categoryName }
    }
`);

const TracksByNavidromeIdsQuery = graphql(`
    query TracksByNavidromeIds($ids: [String!]!) {
        tracksByNavidromeIds(ids: $ids) {
            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
            lyricsSynced format fileSize durationMs bitrate published listed trashedAt navidromeId fileMissing averageRating ratingCount
                replayGain { trackGain trackPeak albumGain albumPeak }
        }
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
const AlbumKindCreateMutation = graphql(`
    mutation AlbumKindCreate($input: AlbumKindInput!) { albumKindCreate(input: $input) { id } }
`);
const AlbumKindUpdateMutation = graphql(`
    mutation AlbumKindUpdate($id: ID!, $input: AlbumKindInput!) { albumKindUpdate(id: $id, input: $input) { id } }
`);
const AlbumKindsReorderMutation = graphql(`
    mutation AlbumKindsReorder($ids: [ID!]!) { albumKindsReorder(ids: $ids) { id } }
`);
const AlbumKindDeleteMutation = graphql(`
    mutation AlbumKindDelete($id: ID!) { albumKindDelete(id: $id) }
`);
const CreditsQuery = graphql(`
    query Credits($kind: CreditKind!) {
        credits(kind: $kind) { name trackCount }
    }
`);

const CreditTracksQuery = graphql(`
    query CreditTracks($kind: CreditKind!, $name: String!) {
        creditTracks(kind: $kind, name: $name) {
            id albumId albumTitle discNumber trackNumber title performers melody lyricsAuthor arranger lyrics
            lyricsSynced durationMs listed navidromeId fileMissing averageRating ratingCount
            replayGain { trackGain trackPeak albumGain albumPeak }
        }
    }
`);

const RadioQuery = graphql(`
    query Radio($trackId: ID, $albumId: ID, $limit: Int) {
        radio(trackId: $trackId, albumId: $albumId, limit: $limit) {
            id albumId albumTitle title performers durationMs navidromeId lyrics lyricsSynced fileMissing
            replayGain { trackGain trackPeak albumGain albumPeak }
        }
    }
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

export async function getTop(by: TopBy, filter: AlbumFilter, limit = 50) {
    return runQuery(TopQuery, {by, filter, limit});
}

export async function getAlbums(filter: AlbumFilter) {
    return runQuery(AlbumsQuery, {filter});
}

/**
 * The albums of the spex and, for originals, their revivals, oldest first, each album once.
 */
export async function getAlbumsOfSpex(spexIds: string[]) {
    const lists = await Promise.all([...new Set(spexIds)].map(spexId => runQuery(SpexAlbumsQuery, {filter: {spexId}})));
    const albums = new Map(lists.flatMap(list => list?.albums ?? []).map(album => [album.id, album]));

    return [...albums.values()].sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.title.localeCompare(b.title));
}

export async function getAlbum(id: string) {
    return (await runQuery(AlbumQuery, {id}))?.album ?? null;
}

export async function search(q: string) {
    return (await runQuery(SearchQuery, {q}))?.search;
}

export async function getAlbumKinds() {
    return (await runQuery(AlbumKindsQuery, {}))?.albumKinds ?? [];
}

export async function getAlbumsByNavidromeIds(ids: string[]) {
    return ids.length === 0 ? [] : (await runQuery(AlbumsByNavidromeIdsQuery, {ids}))?.albumsByNavidromeIds ?? [];
}

export async function searchSpex(q: string) {
    return (await runQuery(SpexSearchQuery, {q}))?.spexSearch ?? [];
}

export async function getTracksByNavidromeIds(ids: string[]) {
    return ids.length === 0 ? [] : (await runQuery(TracksByNavidromeIdsQuery, {ids}))?.tracksByNavidromeIds ?? [];
}

export async function getCredits(kind: CreditKind) {
    return (await runQuery(CreditsQuery, {kind}))?.credits ?? [];
}

export async function getCreditTracks(kind: CreditKind, name: string) {
    return (await runQuery(CreditTracksQuery, {kind, name}))?.creditTracks ?? [];
}

export async function getRadio(seed: { trackId?: string; albumId?: string }, limit = 50) {
    return (await runQuery(RadioQuery, {trackId: seed.trackId ?? null, albumId: seed.albumId ?? null, limit}))?.radio ?? [];
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

export const albumKindCreate = (input: AlbumKindInput) => runMutation(AlbumKindCreateMutation, {input});
export const albumKindUpdate = (id: string, input: AlbumKindInput) => runMutation(AlbumKindUpdateMutation, {id, input});
export const albumKindsReorder = (ids: string[]) => runMutation(AlbumKindsReorderMutation, {ids});
export const albumKindDelete = (id: string) => runMutation(AlbumKindDeleteMutation, {id});
